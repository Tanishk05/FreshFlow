"use server";

import { auth } from "@/auth";
import client from "@/lib/db";
import { ObjectId } from "mongodb";

export type PerformanceMetrics = {
  totalRevenue: number;
  revenueGrowth: number; // Percentage growth compared to previous period
  fulfillmentRate: number; // Percentage of delivered orders
  averageOrderValue: number;
  totalOrders: number;
  deliveredOrders: number;
  activeListings: number;
  totalQuantitySold: number;
  topSellingProduce: string;
};

interface OrderDocument {
  _id: ObjectId;
  farmerId: ObjectId;
  retailerId: ObjectId;
  produceName: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  status: string;
  orderDate: Date;
  deliveryDate?: Date;
}

interface ProduceDocument {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  isAvailable: boolean;
  isVisible: boolean;
}

export async function getFarmerPerformanceMetrics() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const dbClient = await client;
    const db = dbClient.db(process.env.MONGODB_DB);
    const ordersCollection = db.collection<OrderDocument>("orders");
    const produceCollection = db.collection<ProduceDocument>("produce");

    // Get current month date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfLastMonth = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const lastDayOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Fetch all farmer's orders
    const allOrders = await ordersCollection
      .find({ farmerId: new ObjectId(session.user.id) })
      .toArray();

    // Current month orders
    const currentMonthOrders = allOrders.filter(
      (order) => new Date(order.orderDate) >= firstDayOfMonth
    );

    // Last month orders for comparison
    const lastMonthOrders = allOrders.filter(
      (order) =>
        new Date(order.orderDate) >= firstDayOfLastMonth &&
        new Date(order.orderDate) <= lastDayOfLastMonth
    );

    // Calculate current month metrics
    const totalOrders = currentMonthOrders.length;
    const deliveredOrders = currentMonthOrders.filter(
      (order) => order.status === "delivered"
    ).length;

    const totalRevenue = currentMonthOrders
      .filter((order) => order.status === "delivered")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    const lastMonthRevenue = lastMonthOrders
      .filter((order) => order.status === "delivered")
      .reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Calculate revenue growth
    const revenueGrowth =
      lastMonthRevenue > 0
        ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : 0;

    // Calculate fulfillment rate
    const fulfillmentRate =
      totalOrders > 0 ? (deliveredOrders / totalOrders) * 100 : 0;

    // Calculate average order value
    const averageOrderValue =
      deliveredOrders > 0 ? totalRevenue / deliveredOrders : 0;

    // Get active produce listings
    const activeListings = await produceCollection.countDocuments({
      userId: new ObjectId(session.user.id),
      isAvailable: true,
      isVisible: true,
    });

    // Calculate total quantity sold this month
    const totalQuantitySold = currentMonthOrders
      .filter((order) => order.status === "delivered")
      .reduce((sum, order) => sum + (order.quantity || 0), 0);

    // Find top selling produce
    const produceSales = currentMonthOrders
      .filter((order) => order.status === "delivered")
      .reduce((acc: Record<string, number>, order) => {
        const name = order.produceName;
        if (!acc[name]) {
          acc[name] = 0;
        }
        acc[name] += order.quantity || 0;
        return acc;
      }, {});

    const topSellingProduce =
      Object.entries(produceSales).length > 0
        ? Object.entries(produceSales).sort((a, b) => b[1] - a[1])[0][0]
        : "N/A";

    const metrics: PerformanceMetrics = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      fulfillmentRate: Math.round(fulfillmentRate * 10) / 10,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      totalOrders,
      deliveredOrders,
      activeListings,
      totalQuantitySold,
      topSellingProduce,
    };

    return {
      success: true,
      data: metrics,
    };
  } catch (error) {
    console.error("Error fetching performance metrics:", error);
    return {
      success: false,
      error: "Failed to fetch performance metrics",
    };
  }
}
