"use server";

import { auth } from "@/auth";
import { getOrdersCollection } from "@/models/Order";
import { ObjectId } from "mongodb";

export interface DeliveryEarnings {
  totalEarnings: number;
  deliveriesCompleted: number;
  averageEarningPerDelivery: number;
  earningsThisMonth: number;
  deliveriesThisMonth: number;
  earningsToday: number;
  deliveriesToday: number;
  recentDeliveries: {
    orderId: string;
    produceName: string;
    quantity: number;
    unit: string;
    deliveryFee: number;
    deliveryDate: Date;
    destination: string;
  }[];
}

/**
 * Get distributor's delivery earnings and statistics
 */
export async function getDistributorEarnings(): Promise<{
  success: boolean;
  data?: DeliveryEarnings;
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "distributor") {
      return { success: false, error: "Unauthorized" };
    }

    const ordersCollection = await getOrdersCollection();
    const distributorId = new ObjectId(session.user.id);

    // Get all delivered orders for this distributor
    const deliveredOrders = await ordersCollection
      .find({
        distributorId,
        status: "delivered",
      })
      .sort({ deliveryDate: -1 })
      .toArray();

    // Calculate total earnings
    const totalEarnings = deliveredOrders.reduce(
      (sum, order) => sum + (order.deliveryFee || 0),
      0
    );
    const deliveriesCompleted = deliveredOrders.length;
    const averageEarningPerDelivery =
      deliveriesCompleted > 0 ? totalEarnings / deliveriesCompleted : 0;

    // Calculate this month's earnings
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const ordersThisMonth = deliveredOrders.filter(
      (order) =>
        order.deliveryDate && new Date(order.deliveryDate) >= startOfMonth
    );
    const earningsThisMonth = ordersThisMonth.reduce(
      (sum, order) => sum + (order.deliveryFee || 0),
      0
    );
    const deliveriesThisMonth = ordersThisMonth.length;

    // Calculate today's earnings
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const ordersToday = deliveredOrders.filter(
      (order) =>
        order.deliveryDate && new Date(order.deliveryDate) >= startOfDay
    );
    const earningsToday = ordersToday.reduce(
      (sum, order) => sum + (order.deliveryFee || 0),
      0
    );
    const deliveriesToday = ordersToday.length;

    // Get recent deliveries (last 10)
    const recentDeliveries = deliveredOrders.slice(0, 10).map((order) => ({
      orderId: order._id!.toString(),
      produceName: order.produceName,
      quantity: order.quantity,
      unit: order.unit,
      deliveryFee: order.deliveryFee || 0,
      deliveryDate: order.deliveryDate || order.updatedAt,
      destination: order.destination || "Unknown",
    }));

    return {
      success: true,
      data: {
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        deliveriesCompleted,
        averageEarningPerDelivery:
          Math.round(averageEarningPerDelivery * 100) / 100,
        earningsThisMonth: Math.round(earningsThisMonth * 100) / 100,
        deliveriesThisMonth,
        earningsToday: Math.round(earningsToday * 100) / 100,
        deliveriesToday,
        recentDeliveries,
      },
    };
  } catch (error) {
    console.error("Error fetching distributor earnings:", error);
    return { success: false, error: "Failed to fetch earnings data" };
  }
}

/**
 * Get earnings summary for a specific date range
 */
export async function getEarningsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<{
  success: boolean;
  data?: {
    totalEarnings: number;
    deliveriesCount: number;
    averagePerDelivery: number;
  };
  error?: string;
}> {
  try {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "distributor") {
      return { success: false, error: "Unauthorized" };
    }

    const ordersCollection = await getOrdersCollection();
    const distributorId = new ObjectId(session.user.id);

    const orders = await ordersCollection
      .find({
        distributorId,
        status: "delivered",
        deliveryDate: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .toArray();

    const totalEarnings = orders.reduce(
      (sum, order) => sum + (order.deliveryFee || 0),
      0
    );
    const deliveriesCount = orders.length;
    const averagePerDelivery =
      deliveriesCount > 0 ? totalEarnings / deliveriesCount : 0;

    return {
      success: true,
      data: {
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        deliveriesCount,
        averagePerDelivery: Math.round(averagePerDelivery * 100) / 100,
      },
    };
  } catch (error) {
    console.error("Error fetching earnings by date range:", error);
    return { success: false, error: "Failed to fetch earnings data" };
  }
}
