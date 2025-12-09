/**
 * Shipment Repository
 * Single Responsibility: Handle all database operations for shipments
 * Dependency Inversion: Provides abstraction over database access
 */

import { getShipmentsCollection, type Shipment } from "@/models/Shipment";
import { ObjectId } from "mongodb";
import { convertToObjectId } from "./base.repository";

export interface ShipmentQuery {
  farmerId?: string | ObjectId;
  orderId?: string | ObjectId;
  status?: Shipment["status"];
}

export class ShipmentRepository {
  /**
   * Find shipments with filters
   */
  async findMany(query: ShipmentQuery): Promise<Shipment[]> {
    const shipmentsCollection = await getShipmentsCollection();
    const mongoQuery: any = {};

    if (query.farmerId) {
      mongoQuery.farmerId = convertToObjectId(query.farmerId);
    }
    if (query.orderId) {
      mongoQuery.orderId = convertToObjectId(query.orderId);
    }
    if (query.status) {
      mongoQuery.status = query.status;
    }

    return shipmentsCollection
      .find(mongoQuery)
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Find shipments by farmer ID
   */
  async findByFarmerId(farmerId: string | ObjectId): Promise<Shipment[]> {
    return this.findMany({ farmerId });
  }

  /**
   * Find shipment by ID
   */
  async findById(shipmentId: string | ObjectId): Promise<Shipment | null> {
    const shipmentsCollection = await getShipmentsCollection();
    return shipmentsCollection.findOne({
      _id: convertToObjectId(shipmentId),
    });
  }

  /**
   * Create new shipment
   */
  async create(
    shipment: Omit<Shipment, "_id">
  ): Promise<{ insertedId: ObjectId }> {
    const shipmentsCollection = await getShipmentsCollection();
    const result = await shipmentsCollection.insertOne(shipment as Shipment);
    return { insertedId: result.insertedId };
  }

  /**
   * Update shipment
   */
  async update(
    shipmentId: string | ObjectId,
    updates: Partial<Shipment>
  ): Promise<{ success: boolean; modifiedCount: number }> {
    const shipmentsCollection = await getShipmentsCollection();
    const result = await shipmentsCollection.updateOne(
      { _id: convertToObjectId(shipmentId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return {
      success: result.modifiedCount > 0,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Update shipment status
   */
  async updateStatus(
    shipmentId: string | ObjectId,
    status: Shipment["status"]
  ): Promise<{ success: boolean; modifiedCount: number }> {
    return this.update(shipmentId, { status });
  }

  /**
   * Delete shipment
   */
  async delete(
    shipmentId: string | ObjectId
  ): Promise<{ success: boolean; deletedCount: number }> {
    const shipmentsCollection = await getShipmentsCollection();
    const result = await shipmentsCollection.deleteOne({
      _id: convertToObjectId(shipmentId),
    });
    return {
      success: result.deletedCount > 0,
      deletedCount: result.deletedCount,
    };
  }

  /**
   * Count active shipments
   */
  async countActive(): Promise<number> {
    const shipmentsCollection = await getShipmentsCollection();
    return shipmentsCollection.countDocuments({
      status: { $in: ["awaiting-pickup", "picked-up", "in-transit"] },
    });
  }
}

// Export singleton instance
export const shipmentRepository = new ShipmentRepository();

