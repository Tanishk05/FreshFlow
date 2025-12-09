/**
 * Order Repository
 * Single Responsibility: Handle all database operations for orders
 * Dependency Inversion: Provides abstraction over database access
 */

import { getOrdersCollection, type Order, type OrderStatus } from "@/models/Order";
import { ObjectId } from "mongodb";
import type { PaginationOptions, PaginatedResult } from "./base.repository";
import { convertToObjectId } from "./base.repository";

export interface OrderQuery {
  farmerId?: string | ObjectId;
  retailerId?: string | ObjectId;
  distributorId?: string | ObjectId;
  status?: OrderStatus;
  produceId?: string | ObjectId;
}

export class OrderRepository {
  /**
   * Find orders with filters and pagination
   */
  async findMany(
    query: OrderQuery,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<Order>> {
    const ordersCollection = await getOrdersCollection();
    const mongoQuery: any = {};

    if (query.farmerId) {
      mongoQuery.farmerId = convertToObjectId(query.farmerId);
    }
    if (query.retailerId) {
      mongoQuery.retailerId = convertToObjectId(query.retailerId);
    }
    if (query.distributorId) {
      mongoQuery.distributorId = convertToObjectId(query.distributorId);
    }
    if (query.status) {
      mongoQuery.status = query.status;
    }
    if (query.produceId) {
      mongoQuery.produceId = convertToObjectId(query.produceId);
    }

    const total = await ordersCollection.countDocuments(mongoQuery);
    const pages = Math.ceil(total / pagination.limit);
    const skip = (pagination.page - 1) * pagination.limit;

    const orders = await ordersCollection
      .find(mongoQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pagination.limit)
      .toArray();

    return {
      data: orders,
      total,
      pages,
      currentPage: pagination.page,
    };
  }

  /**
   * Find orders by farmer ID
   */
  async findByFarmerId(farmerId: string | ObjectId): Promise<Order[]> {
    const ordersCollection = await getOrdersCollection();
    return ordersCollection
      .find({ farmerId: convertToObjectId(farmerId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Find orders by retailer ID
   */
  async findByRetailerId(retailerId: string | ObjectId): Promise<Order[]> {
    const ordersCollection = await getOrdersCollection();
    return ordersCollection
      .find({ retailerId: convertToObjectId(retailerId) })
      .sort({ createdAt: -1 })
      .toArray();
  }

  /**
   * Find order by ID
   */
  async findById(orderId: string | ObjectId): Promise<Order | null> {
    const ordersCollection = await getOrdersCollection();
    return ordersCollection.findOne({ _id: convertToObjectId(orderId) });
  }

  /**
   * Create new order
   */
  async create(order: Omit<Order, "_id">): Promise<{ insertedId: ObjectId }> {
    const ordersCollection = await getOrdersCollection();
    const result = await ordersCollection.insertOne(order as Order);
    return { insertedId: result.insertedId };
  }

  /**
   * Update order
   */
  async update(
    orderId: string | ObjectId,
    updates: Partial<Order>
  ): Promise<{ success: boolean; modifiedCount: number }> {
    const ordersCollection = await getOrdersCollection();
    const result = await ordersCollection.updateOne(
      { _id: convertToObjectId(orderId) },
      { $set: { ...updates, updatedAt: new Date() } }
    );
    return {
      success: result.modifiedCount > 0,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Update order status
   */
  async updateStatus(
    orderId: string | ObjectId,
    status: OrderStatus
  ): Promise<{ success: boolean; modifiedCount: number }> {
    return this.update(orderId, { status });
  }

  /**
   * Delete order
   */
  async delete(orderId: string | ObjectId): Promise<{ success: boolean; deletedCount: number }> {
    const ordersCollection = await getOrdersCollection();
    const result = await ordersCollection.deleteOne({
      _id: convertToObjectId(orderId),
    });
    return {
      success: result.deletedCount > 0,
      deletedCount: result.deletedCount,
    };
  }

  /**
   * Count orders by status
   */
  async countByStatus(status: OrderStatus): Promise<number> {
    const ordersCollection = await getOrdersCollection();
    return ordersCollection.countDocuments({ status });
  }

  /**
   * Count orders by farmer
   */
  async countByFarmer(farmerId: string | ObjectId): Promise<number> {
    const ordersCollection = await getOrdersCollection();
    return ordersCollection.countDocuments({
      farmerId: convertToObjectId(farmerId),
    });
  }
}

// Export singleton instance
export const orderRepository = new OrderRepository();

