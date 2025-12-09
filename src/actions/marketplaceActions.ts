"use server";

import { produceRepository } from "@/repositories/produce.repository";
import { userRepository } from "@/repositories/user.repository";
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
    // Find all produce that is visible and available
    const produceItems = await produceRepository.findMany({
      isVisible: true,
      isAvailable: true,
    });

    // Sort by createdAt descending
    produceItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Get unique farmer IDs
    const farmerIds = [...new Set(produceItems.map((p) => p.userId.toString()))];

    // Fetch farmer details
    const farmers = await Promise.all(
      farmerIds.map((id) => userRepository.findById(id))
    );
    const validFarmers = farmers.filter((f) => f !== null && f.role === "farmer");

    // Create a map of farmer details
    const farmerMap = new Map(
      validFarmers.map((f) => [
        f!._id.toString(),
        { name: f!.name, email: f!.email },
      ])
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
    const produceItems = await produceRepository.findMany({
      userId: farmerId,
      isVisible: true,
      isAvailable: true,
    });

    // Sort by createdAt descending
    produceItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const farmer = await userRepository.findById(farmerId);

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
    const searchRegex = new RegExp(query, "i");

    // Get all visible and available produce
    const allProduce = await produceRepository.findMany({
      isVisible: true,
      isAvailable: true,
    });

    // Filter by search query
    const produceItems = allProduce.filter(
      (p) => searchRegex.test(p.name) || searchRegex.test(p.category)
    );

    // Sort by createdAt descending
    produceItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const farmerIds = [...new Set(produceItems.map((p) => p.userId.toString()))];

    const farmers = await Promise.all(
      farmerIds.map((id) => userRepository.findById(id))
    );
    const validFarmers = farmers.filter((f) => f !== null && f.role === "farmer");

    const farmerMap = new Map(
      validFarmers.map((f) => [
        f!._id.toString(),
        { name: f!.name, email: f!.email },
      ])
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
