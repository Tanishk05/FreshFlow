"use server";

import { getProduceCollection } from "@/models/Produce";
import { getUsersCollection } from "@/models/User";
import { ObjectId } from "mongodb";

export interface MarketplaceProduce {
  _id: string;
  farmerId: string;
  farmerName: string;
  farmerEmail: string;
  name: string;
  category: "vegetable" | "fruit" | "grain" | "herb";
  quantity: number;
  unit: "kg" | "tons" | "bags";
  pricePerUnit: number;
  image: string;
  harvestDate: string;
  shelfLifeDays: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Get all available produce from farmers for the marketplace
 * Only returns produce that is visible and available
 */
export async function getMarketplaceProduce(): Promise<MarketplaceProduce[]> {
  try {
    const produceCollection = await getProduceCollection();
    const usersCollection = await getUsersCollection();

    // Find all produce that is visible and available
    const produceItems = await produceCollection
      .find({
        isVisible: true,
        isAvailable: true,
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Get unique farmer IDs
    const farmerIds = [...new Set(produceItems.map((p) => p.userId))];

    // Fetch farmer details
    const farmers = await usersCollection
      .find({
        _id: { $in: farmerIds },
        role: "farmer",
      })
      .toArray();

    // Create a map of farmer details
    const farmerMap = new Map(
      farmers.map((f) => [f._id.toString(), { name: f.name, email: f.email }])
    );

    // Combine produce with farmer details
    const marketplaceProduce: MarketplaceProduce[] = produceItems.map((p) => {
      const farmer = farmerMap.get(p.userId.toString());
      return {
        _id: p._id!.toString(),
        farmerId: p.userId.toString(),
        farmerName: farmer?.name || "Unknown Farmer",
        farmerEmail: farmer?.email || "",
        name: p.name,
        category: p.category,
        quantity: p.quantity,
        unit: p.unit,
        pricePerUnit: p.pricePerUnit,
        image: p.image,
        harvestDate: p.harvestDate,
        shelfLifeDays: p.shelfLifeDays,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return marketplaceProduce;
  } catch (error) {
    console.error("Error fetching marketplace produce:", error);
    throw new Error("Failed to fetch marketplace produce");
  }
}

/**
 * Get produce by specific farmer
 */
export async function getProduceByFarmer(
  farmerId: string
): Promise<MarketplaceProduce[]> {
  try {
    const produceCollection = await getProduceCollection();
    const usersCollection = await getUsersCollection();

    const produceItems = await produceCollection
      .find({
        userId: new ObjectId(farmerId),
        isVisible: true,
        isAvailable: true,
      })
      .sort({ createdAt: -1 })
      .toArray();

    const farmer = await usersCollection.findOne({
      _id: new ObjectId(farmerId),
      role: "farmer",
    });

    const marketplaceProduce: MarketplaceProduce[] = produceItems.map((p) => ({
      _id: p._id!.toString(),
      farmerId: p.userId.toString(),
      farmerName: farmer?.name || "Unknown Farmer",
      farmerEmail: farmer?.email || "",
      name: p.name,
      category: p.category,
      quantity: p.quantity,
      unit: p.unit,
      pricePerUnit: p.pricePerUnit,
      image: p.image,
      harvestDate: p.harvestDate,
      shelfLifeDays: p.shelfLifeDays,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return marketplaceProduce;
  } catch (error) {
    console.error("Error fetching farmer produce:", error);
    throw new Error("Failed to fetch farmer produce");
  }
}

/**
 * Search produce by name or category
 */
export async function searchMarketplaceProduce(
  query: string
): Promise<MarketplaceProduce[]> {
  try {
    const produceCollection = await getProduceCollection();
    const usersCollection = await getUsersCollection();

    const searchRegex = new RegExp(query, "i");

    const produceItems = await produceCollection
      .find({
        isVisible: true,
        isAvailable: true,
        $or: [{ name: searchRegex }, { category: searchRegex }],
      })
      .sort({ createdAt: -1 })
      .toArray();

    const farmerIds = [...new Set(produceItems.map((p) => p.userId))];

    const farmers = await usersCollection
      .find({
        _id: { $in: farmerIds },
        role: "farmer",
      })
      .toArray();

    const farmerMap = new Map(
      farmers.map((f) => [f._id.toString(), { name: f.name, email: f.email }])
    );

    const marketplaceProduce: MarketplaceProduce[] = produceItems.map((p) => {
      const farmer = farmerMap.get(p.userId.toString());
      return {
        _id: p._id!.toString(),
        farmerId: p.userId.toString(),
        farmerName: farmer?.name || "Unknown Farmer",
        farmerEmail: farmer?.email || "",
        name: p.name,
        category: p.category,
        quantity: p.quantity,
        unit: p.unit,
        pricePerUnit: p.pricePerUnit,
        image: p.image,
        harvestDate: p.harvestDate,
        shelfLifeDays: p.shelfLifeDays,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    return marketplaceProduce;
  } catch (error) {
    console.error("Error searching marketplace produce:", error);
    throw new Error("Failed to search marketplace produce");
  }
}
