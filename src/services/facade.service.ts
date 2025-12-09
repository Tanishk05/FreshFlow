/**
 * Facade Service
 * Implements Facade Pattern to provide simplified interface to complex subsystems
 * Hides complexity of multiple services behind a single unified interface
 */

import { orderRepository } from "@/repositories/order.repository";
import { userRepository } from "@/repositories/user.repository";
import { produceRepository } from "@/repositories/produce.repository";
import { fleetRepository } from "@/repositories/fleet.repository";
import { OrderDecoratorFactory } from "./order-decorator.service";
import { orderMediator } from "./order-mediator.service";
import { emitOrderEvent } from "./event-observer.service";
import type { Order } from "@/models/Order";

export interface OrderSummary {
  orderId: string;
  status: string;
  produceName: string;
  quantity: number;
  totalPrice: number;
  farmerName: string;
  retailerName?: string;
  distributorName?: string;
  formattedDate: string;
  statusBadge: string;
}

export interface DashboardStats {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  totalRevenue: number;
  recentOrders: OrderSummary[];
}

/**
 * Order Facade
 * Provides simplified interface for order operations
 */
export class OrderFacade {
  /**
   * Get order summary with all enriched data
   */
  async getOrderSummary(orderId: string): Promise<OrderSummary | null> {
    try {
      const order = await orderRepository.findById(orderId);
      if (!order) return null;

      const decorated = await OrderDecoratorFactory.createFullyDecorated(order);

      return {
        orderId: order._id!.toString(),
        status: order.status,
        produceName: order.produceName,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        farmerName: decorated.farmerName || "Unknown",
        retailerName: decorated.retailerName,
        distributorName: decorated.distributorName,
        formattedDate: decorated.formattedDate || "",
        statusBadge: decorated.statusBadge || order.status,
      };
    } catch (error) {
      console.error("[OrderFacade] Error getting order summary:", error);
      return null;
    }
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats(
    userId: string,
    userRole: string
  ): Promise<DashboardStats> {
    try {
      let orders: Order[] = [];

      // Get orders based on role
      if (userRole === "farmer") {
        orders = await orderRepository.findByFarmerId(userId);
      } else if (userRole === "retailer") {
        orders = await orderRepository.findByRetailerId(userId);
      } else if (userRole === "distributor") {
        const result = await orderRepository.findMany(
          { distributorId: userId },
          { page: 1, limit: 1000 }
        );
        orders = result.data;
      }

      const totalOrders = orders.length;
      const pendingOrders = orders.filter(
        (o) => o.status === "pending" || o.status === "approved"
      ).length;
      const completedOrders = orders.filter(
        (o) => o.status === "delivered"
      ).length;
      const totalRevenue = orders
        .filter((o) => o.status === "delivered")
        .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

      // Get recent orders (last 5)
      const recentOrdersData = orders.slice(0, 5);
      const recentOrders = await Promise.all(
        recentOrdersData.map((order) =>
          this.getOrderSummary(order._id!.toString())
        )
      );

      return {
        totalOrders,
        pendingOrders,
        completedOrders,
        totalRevenue,
        recentOrders: recentOrders.filter((o): o is OrderSummary => o !== null),
      };
    } catch (error) {
      console.error("[OrderFacade] Error getting dashboard stats:", error);
      return {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        totalRevenue: 0,
        recentOrders: [],
      };
    }
  }

  /**
   * Approve order (simplified interface)
   */
  async approveOrder(
    orderId: string,
    farmerId: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    return await orderMediator.mediateApproval(orderId, farmerId);
  }

  /**
   * Assign order (simplified interface)
   */
  async assignOrder(
    orderId: string,
    distributorId: string,
    truckId: string
  ): Promise<{ success: boolean; error?: string }> {
    return await orderMediator.mediateAssignment(
      orderId,
      distributorId,
      truckId
    );
  }

  /**
   * Deliver order (simplified interface)
   */
  async deliverOrder(
    orderId: string,
    distributorId: string
  ): Promise<{ success: boolean; error?: string }> {
    return await orderMediator.mediateDelivery(orderId, distributorId);
  }

  /**
   * Get enriched orders for display
   */
  async getEnrichedOrders(orders: Order[]): Promise<any[]> {
    return await Promise.all(
      orders.map((order) => OrderDecoratorFactory.createDisplayReady(order))
    );
  }
}

/**
 * User Facade
 * Provides simplified interface for user operations
 */
export class UserFacade {
  /**
   * Get user profile with all related data
   */
  async getUserProfile(userId: string): Promise<any> {
    try {
      const user = await userRepository.findById(userId);
      if (!user) return null;

      // Get related statistics
      let orderCount = 0;
      if (user.role === "farmer") {
        const orders = await orderRepository.findByFarmerId(userId);
        orderCount = orders.length;
      } else if (user.role === "retailer") {
        const orders = await orderRepository.findByRetailerId(userId);
        orderCount = orders.length;
      }

      return {
        ...user,
        orderCount,
        profileComplete: !!(user.name && user.address),
      };
    } catch (error) {
      console.error("[UserFacade] Error getting user profile:", error);
      return null;
    }
  }

  /**
   * Search users with simplified interface
   */
  async searchUsers(query: string, role?: string): Promise<any[]> {
    try {
      const result = await userRepository.findMany(
        { search: query, role: role as any },
        { page: 1, limit: 20 }
      );
      return result.data;
    } catch (error) {
      console.error("[UserFacade] Error searching users:", error);
      return [];
    }
  }
}

/**
 * Produce Facade
 * Provides simplified interface for produce operations
 */
export class ProduceFacade {
  /**
   * Get produce with farmer information
   */
  async getProduceWithFarmer(produceId: string): Promise<any> {
    try {
      const produce = await produceRepository.findById(produceId);
      if (!produce) return null;

      const farmer = await userRepository.findById(produce.userId.toString());

      return {
        ...produce,
        farmer: farmer
          ? {
              name: farmer.name,
              location: farmer.address?.city,
            }
          : null,
      };
    } catch (error) {
      console.error(
        "[ProduceFacade] Error getting produce with farmer:",
        error
      );
      return null;
    }
  }

  /**
   * Get available produce for marketplace
   */
  async getAvailableProduce(filters?: {
    category?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<any[]> {
    try {
      // This would use produceRepository with filters
      // Simplified for now
      const allProduce = await produceRepository.findMany({});
      return allProduce.filter((p) => p.quantity > 0).slice(0, 50);
    } catch (error) {
      console.error("[ProduceFacade] Error getting available produce:", error);
      return [];
    }
  }
}

// Export singleton facades
export const orderFacade = new OrderFacade();
export const userFacade = new UserFacade();
export const produceFacade = new ProduceFacade();
