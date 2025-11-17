"use server";

import { getStoreInventoryCollection } from "@/models/StoreInventory";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import {
  generateAIPricingSuggestion,
  getMarketContext,
} from "@/actions/aiPricingActions";
import { isGeminiConfigured } from "@/lib/gemini";

export type PricingSuggestion = {
  id: string;
  itemId: string;
  itemName: string;
  currentPrice: number;
  suggestedPrice: number;
  discountPercentage: number;
  reason: string;
  shelfLifeDays: number;
  urgency: "critical" | "high" | "medium";
};

/**
 * Calculate dynamic pricing suggestions based on shelf life
 */
function calculatePricingSuggestion(
  itemId: string,
  itemName: string,
  currentPrice: number,
  shelfLifeDays: number
): PricingSuggestion | null {
  let discountPercentage = 0;
  let reason = "";
  let urgency: "critical" | "high" | "medium" = "medium";

  // Critical: 0-1 days remaining
  if (shelfLifeDays <= 0) {
    return null; // Item already expired, don't suggest pricing
  } else if (shelfLifeDays === 1) {
    discountPercentage = 50; // 50% off
    reason = "Expires tomorrow - Clear stock urgently";
    urgency = "critical";
  }
  // High urgency: 2 days remaining
  else if (shelfLifeDays === 2) {
    discountPercentage = 30; // 30% off
    reason = "Expires in 2 days - Reduce waste";
    urgency = "high";
  }
  // Medium urgency: 3-4 days remaining
  else if (shelfLifeDays <= 4) {
    discountPercentage = 15; // 15% off
    reason = "Short shelf life - Boost sales";
    urgency = "medium";
  }
  // No discount needed for items with >4 days shelf life
  else {
    return null;
  }

  // Calculate suggested price
  const suggestedPrice = currentPrice * (1 - discountPercentage / 100);

  return {
    id: itemId,
    itemId,
    itemName,
    currentPrice,
    suggestedPrice: Math.round(suggestedPrice * 100) / 100, // Round to 2 decimals
    discountPercentage,
    reason,
    shelfLifeDays,
    urgency,
  };
}

/**
 * Get dynamic pricing suggestions for retailer's inventory
 * Now enhanced with AI pricing when Gemini API is configured
 */
export async function getDynamicPricingSuggestions() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const inventoryCollection = await getStoreInventoryCollection();
    const retailerId = new ObjectId(session.user.id);

    // Get all active inventory items
    const inventory = await inventoryCollection
      .find({
        retailerId,
        status: { $ne: "spoiled" },
        stock: { $gt: 0 },
      })
      .toArray();

    const now = new Date();
    const suggestions: PricingSuggestion[] = [];
    const useAI = isGeminiConfigured();

    // Get market context once for all items if using AI
    const marketContext = useAI ? await getMarketContext() : undefined;

    // Calculate suggestions for each item
    for (const item of inventory) {
      const daysRemaining = Math.ceil(
        (item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Try AI pricing first if configured
      if (useAI) {
        try {
          const aiItem = {
            id: item._id!.toString(),
            name: item.name,
            stock: item.stock,
            reorderPoint: item.reorderPoint || Math.floor(item.stock * 0.3),
            shelfLifeDays: daysRemaining,
            status:
              daysRemaining <= 0
                ? ("spoiled" as const)
                : daysRemaining <= 3
                ? ("expiring" as const)
                : ("fresh" as const),
          };

          const aiSuggestion = await generateAIPricingSuggestion(
            aiItem,
            marketContext
          );

          if (aiSuggestion && aiSuggestion.suggestedPrice < item.price) {
            // Convert AI suggestion to our format
            const discountPercentage = Math.round(
              ((item.price - aiSuggestion.suggestedPrice) / item.price) * 100
            );

            suggestions.push({
              id: item._id!.toString(),
              itemId: item._id!.toString(),
              itemName: item.name,
              currentPrice: item.price,
              suggestedPrice: aiSuggestion.suggestedPrice,
              discountPercentage,
              reason: aiSuggestion.reason,
              shelfLifeDays: daysRemaining,
              urgency:
                daysRemaining <= 1
                  ? "critical"
                  : daysRemaining <= 2
                  ? "high"
                  : "medium",
            });
            continue;
          }
        } catch (error) {
          console.error(
            "AI pricing failed, falling back to rule-based:",
            error
          );
          // Fall through to rule-based pricing
        }
      }

      // Fallback to rule-based pricing
      const suggestion = calculatePricingSuggestion(
        item._id!.toString(),
        item.name,
        item.price,
        daysRemaining
      );

      if (suggestion) {
        suggestions.push(suggestion);
      }
    }

    // Sort by urgency (critical first, then high, then medium)
    const urgencyOrder = { critical: 0, high: 1, medium: 2 };
    suggestions.sort(
      (a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
    );

    return {
      success: true,
      data: suggestions,
    };
  } catch (error) {
    console.error("Error generating pricing suggestions:", error);
    return { success: false, error: "Failed to generate pricing suggestions" };
  }
}

/**
 * Apply a pricing suggestion - update the item's price
 */
export async function applyPricingSuggestion(itemId: string, newPrice: number) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const inventoryCollection = await getStoreInventoryCollection();
    const retailerId = new ObjectId(session.user.id);

    // Verify the item belongs to this retailer
    const item = await inventoryCollection.findOne({
      _id: new ObjectId(itemId),
      retailerId,
    });

    if (!item) {
      return { success: false, error: "Item not found" };
    }

    // Update the price
    await inventoryCollection.updateOne(
      { _id: new ObjectId(itemId) },
      {
        $set: {
          price: newPrice,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/dashboard/retailer");

    return { success: true };
  } catch (error) {
    console.error("Error applying pricing suggestion:", error);
    return { success: false, error: "Failed to apply pricing suggestion" };
  }
}

/**
 * Calculate potential savings from applying all pricing suggestions
 */
export async function calculatePricingSavings() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const suggestionsResult = await getDynamicPricingSuggestions();

    if (!suggestionsResult.success || !suggestionsResult.data) {
      return { success: false, error: "Failed to get suggestions" };
    }

    const suggestions = suggestionsResult.data;

    // Calculate total potential revenue loss if items spoil vs discounted sale
    const inventoryCollection = await getStoreInventoryCollection();
    const retailerId = new ObjectId(session.user.id);

    let potentialWasteSavings = 0;

    for (const suggestion of suggestions) {
      const item = await inventoryCollection.findOne({
        _id: new ObjectId(suggestion.itemId),
        retailerId,
      });

      if (item) {
        // If item spoils: lose full value (currentPrice * stock)
        // If sold at discount: get (suggestedPrice * stock)
        // Savings = suggestedPrice * stock (vs losing everything)
        const savingsPerUnit = suggestion.suggestedPrice;
        potentialWasteSavings += savingsPerUnit * item.stock;
      }
    }

    return {
      success: true,
      data: {
        potentialWasteSavings: Math.round(potentialWasteSavings * 100) / 100,
        suggestionsCount: suggestions.length,
      },
    };
  } catch (error) {
    console.error("Error calculating pricing savings:", error);
    return { success: false, error: "Failed to calculate savings" };
  }
}
