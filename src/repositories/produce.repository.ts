/**
 * Produce Repository
 * Single Responsibility: Handle all database operations for produce
 * Dependency Inversion: Provides abstraction over database access
 */

import { getProduceCollection, type Produce } from "@/models/Produce";
import { ObjectId } from "mongodb";
import { convertToObjectId } from "./base.repository";

export interface ProduceQuery {
  userId?: string | ObjectId;
  category?: "vegetable" | "fruit" | "grain" | "herb";
  isVisible?: boolean;
  isAvailable?: boolean;
}

export class ProduceRepository {
  /**
   * Find produce with filters
   */
  async findMany(query: ProduceQuery): Promise<Produce[]> {
    const produceCollection = await getProduceCollection();
    const mongoQuery: any = {};

    if (query.userId) {
      mongoQuery.userId = convertToObjectId(query.userId);
    }
    if (query.category) {
      mongoQuery.category = query.category;
    }
    if (query.isVisible !== undefined) {
      mongoQuery.isVisible = query.isVisible;
    }
    if (query.isAvailable !== undefined) {
      mongoQuery.isAvailable = query.isAvailable;
    }

    return produceCollection
      .find(mongoQuery)
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Find produce by user ID
   */
  async findByUserId(userId: string | ObjectId): Promise<Produce[]> {
    return this.findMany({ userId });
  }

  /**
   * Find produce by ID
   */
  async findById(produceId: string | ObjectId): Promise<Produce | null> {
    const produceCollection = await getProduceCollection();
    return produceCollection.findOne({
      _id: convertToObjectId(produceId),
    });
  }

  /**
   * Create new produce
   */
  async create(
    produce: Omit<Produce, "_id">
  ): Promise<{ insertedId: ObjectId }> {
    const produceCollection = await getProduceCollection();
    const result = await produceCollection.insertOne(produce as Produce);
    return { insertedId: result.insertedId };
  }

  /**
   * Update produce
   */
  async update(
    produceId: string | ObjectId,
    updates: Partial<Produce>
  ): Promise<{ success: boolean; modifiedCount: number }> {
    const produceCollection = await getProduceCollection();
    const result = await produceCollection.updateOne(
      { _id: convertToObjectId(produceId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return {
      success: result.modifiedCount > 0,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Delete produce
   */
  async delete(
    produceId: string | ObjectId
  ): Promise<{ success: boolean; deletedCount: number }> {
    const produceCollection = await getProduceCollection();
    const result = await produceCollection.deleteOne({
      _id: convertToObjectId(produceId),
    });
    return {
      success: result.deletedCount > 0,
      deletedCount: result.deletedCount,
    };
  }

  /**
   * Count produce by user
   */
  async countByUser(userId: string | ObjectId): Promise<number> {
    const produceCollection = await getProduceCollection();
    return produceCollection.countDocuments({
      userId: convertToObjectId(userId),
    });
  }
}

// Export singleton instance
export const produceRepository = new ProduceRepository();

