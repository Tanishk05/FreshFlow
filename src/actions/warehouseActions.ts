"use server";

import {
  getWarehouseInventoryCollection,
  WarehouseInventory,
} from "@/models/WarehouseInventory";
import { requireAuth } from "@/services/auth.service";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

export async function getMyWarehouseInventory(): Promise<WarehouseInventory[]> {
  const { userId } = await requireAuth();
  // Note: Role check could be moved to a role service

  const collection = await getWarehouseInventoryCollection();
  const items = await collection
    .find({ distributorId: new ObjectId(userId) })
    .sort({ receivedDate: -1 })
    .toArray();

  return items.map((item) => ({
    ...item,
    _id: item._id,
    distributorId: item.distributorId,
    farmerId: item.farmerId,
  }));
}

export async function addWarehouseItem(data: {
  name: string;
  lotNumber: string;
  quantity: number;
  tempZone: "Ambient" | "Cold (2-4°C)" | "Frozen";
  category?: string;
  farmerId?: string;
}) {
  const { userId } = await requireAuth();
  // Note: Role check could be moved to a role service

  const collection = await getWarehouseInventoryCollection();

  const newItem: WarehouseInventory = {
    distributorId: new ObjectId(userId),
    name: data.name,
    lotNumber: data.lotNumber,
    quantity: data.quantity,
    tempZone: data.tempZone,
    receivedDate: new Date(),
    category: data.category,
    farmerId: data.farmerId ? new ObjectId(data.farmerId) : undefined,
    status: "in-stock",
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await collection.insertOne(newItem);

  revalidatePath("/dashboard/distributor");
  return { success: true, id: result.insertedId.toString() };
}

export async function updateWarehouseStock(
  itemId: string,
  quantity: number,
  status?: "in-stock" | "allocated" | "dispatched"
) {
  const { userId } = await requireAuth();
  // Note: Role check could be moved to a role service

  const collection = await getWarehouseInventoryCollection();

  const updateData: Partial<WarehouseInventory> = {
    quantity,
    updatedAt: new Date(),
  };

  if (status) {
    updateData.status = status;
  }

  await collection.updateOne(
    {
      _id: new ObjectId(itemId),
      distributorId: new ObjectId(userId),
    },
    { $set: updateData }
  );

  revalidatePath("/dashboard/distributor");
  return { success: true };
}

export async function deleteWarehouseItem(itemId: string) {
  const { userId } = await requireAuth();
  // Note: Role check could be moved to a role service

  const collection = await getWarehouseInventoryCollection();

  await collection.deleteOne({
    _id: new ObjectId(itemId),
    distributorId: new ObjectId(userId),
  });

  revalidatePath("/dashboard/distributor");
  return { success: true };
}

export async function getWarehouseStats() {
  const { userId } = await requireAuth();
  // Note: Role check could be moved to a role service

  const collection = await getWarehouseInventoryCollection();

  const [totalItems, inStock, allocated] = await Promise.all([
    collection.countDocuments({ distributorId: new ObjectId(userId) }),
    collection.countDocuments({
      distributorId: new ObjectId(userId),
      status: "in-stock",
    }),
    collection.countDocuments({
      distributorId: new ObjectId(userId),
      status: "allocated",
    }),
  ]);

  // Calculate total pallets
  const items = await collection
    .find({ distributorId: new ObjectId(userId) })
    .toArray();
  const totalPallets = items.reduce((sum, item) => sum + item.quantity, 0);
  const maxCapacity = 1000; // Example max capacity in pallets
  const capacityPercentage = Math.round((totalPallets / maxCapacity) * 100);

  return {
    totalItems,
    inStock,
    allocated,
    totalPallets,
    capacityPercentage: Math.min(capacityPercentage, 100),
  };
}
