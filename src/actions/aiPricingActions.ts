"use server";

import { generateJSON, isGeminiConfigured } from "@/lib/gemini";
import type { PricingSuggestion, StoreItem } from "@/lib/data/types";

// Type definitions for AI pricing
interface PricingAnalysis {
  suggestedPrice: number;
  priceChange: number;
  priceChangePercent: number;
  confidence: number;
  reason: string;
  urgency: "low" | "medium" | "high";
  expectedImpact: {
    revenueChange: string;
    salesVelocityChange: string;
    wasteReduction: string;
  };
}

interface MarketContext {
  averageMarketPrice?: number;
  competitorPrices?: number[];
  seasonalDemand?: "high" | "medium" | "low";
  weatherImpact?: string;
}

/**
 * Generate AI-powered pricing suggestions for a store item
 * Uses Google Gemini to analyze multiple factors and optimize pricing
 */
export async function generateAIPricingSuggestion(
  item: StoreItem,
  marketContext?: MarketContext
): Promise<PricingSuggestion & { analysis?: PricingAnalysis }> {
  // Fallback to rule-based pricing if Gemini is not configured
  if (!isGeminiConfigured()) {
    return generateRuleBasedPricing(item);
  }

  try {
    const prompt = `
You are an AI pricing optimization expert for a fresh produce supply chain platform. Analyze the following product and recommend the optimal price.

**Product Details:**
- Name: ${item.name}
- Current Price: ₹${
      item.stock > 0 ? Math.round(Math.random() * 100 + 20) : 50
    }/kg
- Stock Level: ${item.stock} kg
- Reorder Point: ${item.reorderPoint} kg
- Shelf Life Remaining: ${item.shelfLifeDays} days
- Status: ${item.status}

**Market Context:**
${
  marketContext
    ? `
- Average Market Price: ₹${marketContext.averageMarketPrice || "N/A"}/kg
- Competitor Prices: ${marketContext.competitorPrices?.join(", ") || "N/A"}
- Seasonal Demand: ${marketContext.seasonalDemand || "medium"}
- Weather Impact: ${marketContext.weatherImpact || "normal conditions"}
`
    : "Market data not available"
}

**Optimization Goals:**
1. Maximize revenue (price × sales volume)
2. Minimize waste from unsold inventory
3. Remain competitive with market prices
4. Respond to urgency based on shelf life
5. Consider stock levels for dynamic pricing

**Pricing Rules:**
- If shelf life < 3 days: aggressive discount (15-30%)
- If shelf life 3-7 days: moderate discount (5-15%)
- If stock > 2× reorder point: slight discount (2-8%)
- If stock < reorder point: premium pricing (+5-10%)
- Status "expiring": urgent discount (20-40%)
- Status "spoiled": remove from sale (price = 0)

Return your analysis in this exact JSON format:
{
  "suggestedPrice": number,
  "priceChange": number,
  "priceChangePercent": number,
  "confidence": number (0-100),
  "reason": "brief explanation",
  "urgency": "low" | "medium" | "high",
  "expectedImpact": {
    "revenueChange": "e.g., +12%",
    "salesVelocityChange": "e.g., +25%",
    "wasteReduction": "e.g., -15%"
  }
}`;

    const analysis = await generateJSON<PricingAnalysis>(
      prompt,
      "You are a pricing optimization AI. Respond with valid JSON only."
    );

    return {
      id: `ai-price-${item.id}-${Date.now()}`,
      itemId: item.id,
      itemName: item.name,
      currentPrice: item.stock > 0 ? Math.round(Math.random() * 100 + 20) : 50,
      suggestedPrice: analysis.suggestedPrice,
      reason: analysis.reason,
      analysis,
    };
  } catch (error) {
    console.error("Error generating AI pricing:", error);
    return generateRuleBasedPricing(item);
  }
}

/**
 * Generate pricing suggestions for multiple items in batch
 */
export async function generateBatchAIPricing(
  items: StoreItem[],
  marketContext?: MarketContext
): Promise<(PricingSuggestion & { analysis?: PricingAnalysis })[]> {
  // Process items in parallel for better performance
  const pricingPromises = items.map((item) =>
    generateAIPricingSuggestion(item, marketContext)
  );

  return Promise.all(pricingPromises);
}

/**
 * Fallback rule-based pricing when AI is not available
 */
function generateRuleBasedPricing(
  item: StoreItem
): PricingSuggestion & { analysis?: PricingAnalysis } {
  const basePrice = item.stock > 0 ? Math.round(Math.random() * 100 + 20) : 50;
  let suggestedPrice = basePrice;
  let reason = "Standard market price";
  let urgency: "low" | "medium" | "high" = "low";

  // Rule-based pricing logic
  if (item.status === "spoiled") {
    suggestedPrice = 0;
    reason = "Item spoiled - remove from sale";
    urgency = "high";
  } else if (item.status === "expiring" || item.shelfLifeDays < 3) {
    suggestedPrice = Math.round(basePrice * 0.7); // 30% discount
    reason = `Urgent: ${item.shelfLifeDays} days until expiry`;
    urgency = "high";
  } else if (item.shelfLifeDays < 7) {
    suggestedPrice = Math.round(basePrice * 0.9); // 10% discount
    reason = `Quick sale recommended: ${item.shelfLifeDays} days shelf life`;
    urgency = "medium";
  } else if (item.stock > item.reorderPoint * 2) {
    suggestedPrice = Math.round(basePrice * 0.95); // 5% discount
    reason = "High stock - promotional pricing";
    urgency = "low";
  } else if (item.stock < item.reorderPoint) {
    suggestedPrice = Math.round(basePrice * 1.05); // 5% premium
    reason = "Low stock - premium pricing";
    urgency = "low";
  }

  const priceChange = suggestedPrice - basePrice;
  const priceChangePercent = Math.round((priceChange / basePrice) * 100);

  return {
    id: `rule-price-${item.id}-${Date.now()}`,
    itemId: item.id,
    itemName: item.name,
    currentPrice: basePrice,
    suggestedPrice,
    reason,
    analysis: {
      suggestedPrice,
      priceChange,
      priceChangePercent,
      confidence: 75,
      reason,
      urgency,
      expectedImpact: {
        revenueChange:
          priceChangePercent > 0
            ? `+${Math.abs(priceChangePercent)}%`
            : `${priceChangePercent}%`,
        salesVelocityChange:
          priceChangePercent < 0
            ? `+${Math.abs(priceChangePercent * 2)}%`
            : `-${Math.abs(priceChangePercent)}%`,
        wasteReduction:
          urgency === "high"
            ? "20-30%"
            : urgency === "medium"
            ? "10-15%"
            : "5%",
      },
    },
  };
}

/**
 * Get market context from external sources (mock implementation)
 * In production, this would fetch from APIs, web scraping, or database
 */
export async function getMarketContext(): Promise<MarketContext> {
  // Mock market data - in production, fetch from real sources
  return {
    averageMarketPrice: Math.round(Math.random() * 50 + 30),
    competitorPrices: [
      Math.round(Math.random() * 50 + 25),
      Math.round(Math.random() * 50 + 25),
      Math.round(Math.random() * 50 + 25),
    ],
    seasonalDemand: ["high", "medium", "low"][Math.floor(Math.random() * 3)] as
      | "high"
      | "medium"
      | "low",
    weatherImpact: "normal conditions",
  };
}
