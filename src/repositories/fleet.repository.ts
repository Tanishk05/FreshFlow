/**
 * Fleet Repository
 * Single Responsibility: Handle all database operations for fleet
 * Dependency Inversion: Provides abstraction over database access
 */

import { getFleetCollection, type Fleet, type TruckStatus } from "@/models/Fleet";
import { ObjectId } from "mongodb";
import { convertToObjectId } from "./base.repository";

export interface FleetQuery {
  distributorId?: string | ObjectId;
  status?: TruckStatus;
}

export class FleetRepository {
  /**
   * Find fleet with filters
   */
  async findMany(query: FleetQuery): Promise<Fleet[]> {
    const fleetCollection = await getFleetCollection();
    const mongoQuery: any = {};

    if (query.distributorId) {
      mongoQuery.distributorId = convertToObjectId(query.distributorId);
    }
    if (query.status) {
      mongoQuery.status = query.status;
    }

    return fleetCollection.find(mongoQuery).sort({ createdAt: -1 }).toArray();
  }

  /**
   * Find fleet by distributor ID
   */
  async findByDistributorId(
    distributorId: string | ObjectId
  ): Promise<Fleet[]> {
    return this.findMany({ distributorId });
  }

  /**
   * Find fleet by status
   */
  async findByStatus(status: TruckStatus): Promise<Fleet[]> {
    return this.findMany({ status });
  }

  /**
   * Find truck by ID
   */
  async findById(truckId: string | ObjectId): Promise<Fleet | null> {
    const fleetCollection = await getFleetCollection();
    return fleetCollection.findOne({ _id: convertToObjectId(truckId) });
  }

  /**
   * Create new truck
   */
  async create(truck: Omit<Fleet, "_id">): Promise<{ insertedId: ObjectId }> {
    const fleetCollection = await getFleetCollection();
    const result = await fleetCollection.insertOne(truck as Fleet);
    return { insertedId: result.insertedId };
  }

  /**
   * Update truck
   */
  async update(
    truckId: string | ObjectId,
    updates: Partial<Fleet>
  ): Promise<{ success: boolean; modifiedCount: number }> {
    const fleetCollection = await getFleetCollection();
    const result = await fleetCollection.updateOne(
      { _id: convertToObjectId(truckId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return {
      success: result.modifiedCount > 0,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Update truck status
   */
  async updateStatus(
    truckId: string | ObjectId,
    status: TruckStatus
  ): Promise<{ success: boolean; modifiedCount: number }> {
    return this.update(truckId, { status });
  }

  /**
   * Update truck load
   */
  async updateLoad(
    truckId: string | ObjectId,
    currentLoadKg: number
  ): Promise<{ success: boolean; modifiedCount: number }> {
    return this.update(truckId, { currentLoadKg });
  }

  /**
   * Delete truck
   */
  async delete(truckId: string | ObjectId): Promise<{ success: boolean; deletedCount: number }> {
    const fleetCollection = await getFleetCollection();
    const result = await fleetCollection.deleteOne({
      _id: convertToObjectId(truckId),
    });
    return {
      success: result.deletedCount > 0,
      deletedCount: result.deletedCount,
    };
  }
}

// Export singleton instance
export const fleetRepository = new FleetRepository();

