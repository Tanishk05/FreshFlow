"use server";

import { requireAuth } from "@/services/auth.service";
import { produceRepository } from "@/repositories/produce.repository";
import { serializeDocument } from "@/lib/serialization";
import { revalidatePath } from "next/cache";
import type { Produce } from "@/models/Produce";
import { ObjectId } from "mongodb";

// Get all produce for the current user
export async function getMyProduce() {
  try {
    const { userId } = await requireAuth();

    const produce = await produceRepository.findByUserId(userId);

    return {
      success: true,
      data: produce.map((p) => serializeDocument(p)),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message };
    }
    console.error("Error fetching produce:", error);
    return { success: false, error: "Failed to fetch produce" };
  }
}

// Add new produce
export async function addProduce(data: {
  name: string;
  category: "vegetable" | "fruit" | "grain" | "herb";
  quantity: number;
  unit: "kg" | "tons" | "bags";
  pricePerUnit: number;
  image: string;
  harvestDate: string;
  shelfLifeDays: number;
}) {
  try {
    const { userId } = await requireAuth();

    // Check if user is a farmer (this could be moved to a role service)
    // For now, we'll keep it simple
    const newProduce: Omit<Produce, "_id"> = {
      userId: new ObjectId(userId),
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      unit: data.unit,
      pricePerUnit: data.pricePerUnit,
      image: data.image,
      isVisible: true,
      isAvailable: true,
      harvestDate: data.harvestDate,
      shelfLifeDays: data.shelfLifeDays,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await produceRepository.create(newProduce);

    revalidatePath("/my-produce");

    return {
      success: true,
      data: serializeDocument({
        ...newProduce,
        _id: result.insertedId,
      }),
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message };
    }
    console.error("Error adding produce:", error);
    return { success: false, error: "Failed to add produce" };
  }
}

// Update produce
export async function updateProduce(
  id: string,
  data: {
    name: string;
    category: "vegetable" | "fruit" | "grain" | "herb";
    quantity: number;
    unit: "kg" | "tons" | "bags";
    pricePerUnit: number;
    image: string;
    harvestDate: string;
    shelfLifeDays: number;
  }
) {
  try {
    const { userId } = await requireAuth();

    // Verify ownership
    const existingProduce = await produceRepository.findById(id);
    if (!existingProduce || existingProduce.userId.toString() !== userId) {
      return { success: false, error: "Produce not found or unauthorized" };
    }

    const result = await produceRepository.update(id, {
      name: data.name,
      category: data.category,
      quantity: data.quantity,
      unit: data.unit,
      pricePerUnit: data.pricePerUnit,
      image: data.image,
      harvestDate: data.harvestDate,
      shelfLifeDays: data.shelfLifeDays,
    });

    revalidatePath("/my-produce");

    return { success: result.success, data: result };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message };
    }
    console.error("Error updating produce:", error);
    return { success: false, error: "Failed to update produce" };
  }
}

// Delete produce
export async function deleteProduce(id: string) {
  try {
    const { userId } = await requireAuth();

    // Verify ownership
    const existingProduce = await produceRepository.findById(id);
    if (!existingProduce || existingProduce.userId.toString() !== userId) {
      return { success: false, error: "Produce not found or unauthorized" };
    }

    const result = await produceRepository.delete(id);

    if (!result.success) {
      return { success: false, error: "Produce not found or unauthorized" };
    }

    revalidatePath("/my-produce");

    return { success: true };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message };
    }
    console.error("Error deleting produce:", error);
    return { success: false, error: "Failed to delete produce" };
  }
}

// Toggle visibility
export async function toggleProduceVisibility(id: string) {
  try {
    const { userId } = await requireAuth();

    // Get current produce and verify ownership
    const produce = await produceRepository.findById(id);
    if (!produce || produce.userId.toString() !== userId) {
      return { success: false, error: "Produce not found or unauthorized" };
    }

    const result = await produceRepository.update(id, {
      isVisible: !produce.isVisible,
    });

    revalidatePath("/my-produce");

    return { success: result.success, isVisible: !produce.isVisible };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message };
    }
    console.error("Error toggling visibility:", error);
    return { success: false, error: "Failed to toggle visibility" };
  }
}

// Toggle availability
export async function toggleProduceAvailability(id: string) {
  try {
    const { userId } = await requireAuth();

    // Get current produce and verify ownership
    const produce = await produceRepository.findById(id);
    if (!produce || produce.userId.toString() !== userId) {
      return { success: false, error: "Produce not found or unauthorized" };
    }

    const result = await produceRepository.update(id, {
      isAvailable: !produce.isAvailable,
    });

    revalidatePath("/my-produce");

    return { success: result.success, isAvailable: !produce.isAvailable };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, error: error.message };
    }
    console.error("Error toggling availability:", error);
    return { success: false, error: "Failed to toggle availability" };
  }
}
