"use server";

import { auth } from "@/auth";
import { getProduceCollection, Produce } from "@/models/Produce";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// Get all produce for the current user
export async function getMyProduce() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const produceCollection = await getProduceCollection();
    const produce = await produceCollection
      .find({ userId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray();

    return {
      success: true,
      data: produce.map((p) => ({
        ...p,
        _id: p._id?.toString(),
        userId: p.userId.toString(),
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    };
  } catch (error) {
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
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (session.user.role !== "farmer") {
      return { success: false, error: "Only farmers can add produce" };
    }

    const produceCollection = await getProduceCollection();
    const now = new Date();

    const newProduce: Omit<Produce, "_id"> = {
      userId: new ObjectId(session.user.id),
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
      createdAt: now,
      updatedAt: now,
    };

    const result = await produceCollection.insertOne(newProduce as Produce);

    revalidatePath("/my-produce");

    return {
      success: true,
      data: {
        ...newProduce,
        _id: result.insertedId.toString(),
        userId: newProduce.userId.toString(),
        createdAt: newProduce.createdAt.toISOString(),
        updatedAt: newProduce.updatedAt.toISOString(),
      },
    };
  } catch (error) {
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
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const produceCollection = await getProduceCollection();

    // Verify ownership
    const existingProduce = await produceCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.user.id),
    });

    if (!existingProduce) {
      return { success: false, error: "Produce not found or unauthorized" };
    }

    const result = await produceCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: data.name,
          category: data.category,
          quantity: data.quantity,
          unit: data.unit,
          pricePerUnit: data.pricePerUnit,
          image: data.image,
          harvestDate: data.harvestDate,
          shelfLifeDays: data.shelfLifeDays,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/my-produce");

    return { success: true, data: result };
  } catch (error) {
    console.error("Error updating produce:", error);
    return { success: false, error: "Failed to update produce" };
  }
}

// Delete produce
export async function deleteProduce(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const produceCollection = await getProduceCollection();

    // Verify ownership
    const result = await produceCollection.deleteOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.user.id),
    });

    if (result.deletedCount === 0) {
      return { success: false, error: "Produce not found or unauthorized" };
    }

    revalidatePath("/my-produce");

    return { success: true };
  } catch (error) {
    console.error("Error deleting produce:", error);
    return { success: false, error: "Failed to delete produce" };
  }
}

// Toggle visibility
export async function toggleProduceVisibility(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const produceCollection = await getProduceCollection();

    // Get current produce
    const produce = await produceCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.user.id),
    });

    if (!produce) {
      return { success: false, error: "Produce not found or unauthorized" };
    }

    await produceCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isVisible: !produce.isVisible,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/my-produce");

    return { success: true, isVisible: !produce.isVisible };
  } catch (error) {
    console.error("Error toggling visibility:", error);
    return { success: false, error: "Failed to toggle visibility" };
  }
}

// Toggle availability
export async function toggleProduceAvailability(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const produceCollection = await getProduceCollection();

    // Get current produce
    const produce = await produceCollection.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(session.user.id),
    });

    if (!produce) {
      return { success: false, error: "Produce not found or unauthorized" };
    }

    await produceCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          isAvailable: !produce.isAvailable,
          updatedAt: new Date(),
        },
      }
    );

    revalidatePath("/my-produce");

    return { success: true, isAvailable: !produce.isAvailable };
  } catch (error) {
    console.error("Error toggling availability:", error);
    return { success: false, error: "Failed to toggle availability" };
  }
}
