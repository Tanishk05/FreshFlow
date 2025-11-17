"use server";

import {
  getStoreInventoryCollection,
  StoreInventory,
} from "@/models/StoreInventory";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

/**
 * Get all store inventory for the current retailer
 */
export async function getMyStoreInventory() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const inventoryCollection = await getStoreInventoryCollection();
    const retailerId = new ObjectId(session.user.id);

    const inventory = await inventoryCollection
      .find({ retailerId })
      .sort({ shelfLifeDays: 1 }) // Sort by shelf life ascending (expiring soon first)
      .toArray();

    // Calculate days remaining dynamically
    const now = new Date();
    const updatedInventory = inventory.map((item) => {
      const daysRemaining = Math.ceil(
        (item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      let status: "fresh" | "expiring" | "spoiled" = "fresh";
      if (daysRemaining <= 0) {
        status = "spoiled";
      } else if (daysRemaining <= 2) {
        status = "expiring";
      }

      return {
        ...item,
        _id: item._id!.toString(),
        retailerId: item.retailerId.toString(),
        shelfLifeDays: Math.max(0, daysRemaining),
        status,
      };
    });

    return {
      success: true,
      data: updatedInventory,
    };
  } catch (error) {
    console.error("Error fetching store inventory:", error);
    return { success: false, error: "Failed to fetch store inventory" };
  }
}

/**
 * Add item to store inventory
 */
export async function addStoreInventoryItem(data: {
  name: string;
  stock: number;
  reorderPoint: number;
  shelfLifeDays: number;
  price: number;
  category?: string;
}) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const inventoryCollection = await getStoreInventoryCollection();
    const now = new Date();
    const expiryDate = new Date(now);
    expiryDate.setDate(expiryDate.getDate() + data.shelfLifeDays);

    const item: StoreInventory = {
      retailerId: new ObjectId(session.user.id),
      name: data.name,
      stock: data.stock,
      reorderPoint: data.reorderPoint,
      shelfLifeDays: data.shelfLifeDays,
      status: "fresh",
      purchaseDate: now,
      expiryDate,
      price: data.price,
      category: data.category,
      createdAt: now,
      updatedAt: now,
    };

    const result = await inventoryCollection.insertOne(item);

    revalidatePath("/dashboard/retailer");

    return {
      success: true,
      data: {
        ...item,
        _id: result.insertedId.toString(),
        retailerId: item.retailerId.toString(),
      },
    };
  } catch (error) {
    console.error("Error adding inventory item:", error);
    return { success: false, error: "Failed to add inventory item" };
  }
}

/**
 * Update inventory item stock
 */
export async function updateInventoryStock(itemId: string, newStock: number) {
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

    await inventoryCollection.updateOne(
      { _id: new ObjectId(itemId) },
      {
        $set: {
          stock: newStock,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/dashboard/retailer");

    return { success: true };
  } catch (error) {
    console.error("Error updating inventory stock:", error);
    return { success: false, error: "Failed to update inventory stock" };
  }
}

/**
 * Mark inventory item as spoiled
 */
export async function markItemAsSpoiled(itemId: string) {
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

    await inventoryCollection.updateOne(
      { _id: new ObjectId(itemId) },
      {
        $set: {
          status: "spoiled",
          stock: 0,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/dashboard/retailer");

    return { success: true };
  } catch (error) {
    console.error("Error marking item as spoiled:", error);
    return { success: false, error: "Failed to mark item as spoiled" };
  }
}

/**
 * Delete inventory item
 */
export async function deleteInventoryItem(itemId: string) {
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

    await inventoryCollection.deleteOne({ _id: new ObjectId(itemId) });

    revalidatePath("/dashboard/retailer");

    return { success: true };
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return { success: false, error: "Failed to delete inventory item" };
  }
}

/**
 * Get inventory statistics
 */
export async function getInventoryStats() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const inventoryCollection = await getStoreInventoryCollection();
    const retailerId = new ObjectId(session.user.id);

    const inventory = await inventoryCollection.find({ retailerId }).toArray();

    const now = new Date();

    // Calculate stats
    const expiringSoonCount = inventory.filter((item) => {
      const daysRemaining = Math.ceil(
        (item.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );
      return daysRemaining > 0 && daysRemaining <= 2;
    }).length;

    const lowStockCount = inventory.filter(
      (item) => item.stock > 0 && item.stock < item.reorderPoint
    ).length;

    const spoiledCount = inventory.filter(
      (item) => item.status === "spoiled" || item.expiryDate < now
    ).length;

    const totalValue = inventory.reduce(
      (sum, item) => sum + item.stock * item.price,
      0
    );

    return {
      success: true,
      data: {
        expiringSoonCount,
        lowStockCount,
        spoiledCount,
        totalItems: inventory.length,
        totalValue,
      },
    };
  } catch (error) {
    console.error("Error fetching inventory stats:", error);
    return { success: false, error: "Failed to fetch inventory stats" };
  }
}
