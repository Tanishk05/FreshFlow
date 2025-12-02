"use server";

import { auth } from "@/auth";
import { getOrdersCollection } from "@/models/Order";
import { getRetailerOrderCollection } from "@/models/RetailerOrder";
import { ObjectId } from "mongodb";

export type EarningsData = {
  totalRevenue: number;
  grossSales: number;
  platformCommission: number;
  totalOrders: number;
  subscriptionTier: string;
  avgOrderValue?: number;
};

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

/**
 * Get earnings for the current user based on their role
 */
export async function getEarnings(
  period: "week" | "month" | "year" = "month"
): Promise<{ success: boolean; data?: EarningsData; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const role = session.user.role;
    const userId = new ObjectId(session.user.id);

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    if (period === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    if (role === "farmer") {
      return await getFarmerEarnings(userId, startDate);
    } else if (role === "distributor") {
      return await getDistributorEarningsNew(userId, startDate);
    } else if (role === "retailer") {
      return await getRetailerEarnings(userId, startDate);
    }

    return { success: false, error: "Invalid user role" };
  } catch (error) {
    console.error("Error fetching earnings:", error);
    return { success: false, error: "Failed to fetch earnings" };
  }
}

async function getFarmerEarnings(userId: ObjectId, startDate: Date) {
  const ordersCollection = await getOrdersCollection();

  const orders = await ordersCollection
    .find({
      farmerId: userId,
      status: "delivered",
      createdAt: { $gte: startDate },
    })
    .toArray();

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.farmerRevenue || 0),
    0
  );
  const grossSales = orders.reduce(
    (sum, order) => sum + order.quantity * order.pricePerUnit,
    0
  );
  const platformCommission = orders.reduce(
    (sum, order) => sum + (order.platformCommission || 0),
    0
  );

  // Get subscription tier from first order or default to free
  const subscriptionTier = orders[0]?.retailerSubscriptionTier || "free";

  return {
    success: true,
    data: {
      totalRevenue,
      grossSales,
      platformCommission,
      totalOrders: orders.length,
      subscriptionTier,
      avgOrderValue: orders.length > 0 ? grossSales / orders.length : 0,
    },
  };
}

async function getDistributorEarningsNew(userId: ObjectId, startDate: Date) {
  const ordersCollection = await getOrdersCollection();

  const orders = await ordersCollection
    .find({
      distributorId: userId,
      status: "delivered",
      createdAt: { $gte: startDate },
    })
    .toArray();

  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.distributorRevenue || 0),
    0
  );
  const totalDeliveryFees = orders.reduce(
    (sum, order) => sum + (order.finalDeliveryFee || 0),
    0
  );

  return {
    success: true,
    data: {
      totalRevenue,
      grossSales: totalDeliveryFees,
      platformCommission: 0, // Distributors don't pay commission
      totalOrders: orders.length,
      subscriptionTier: "free",
      avgOrderValue: orders.length > 0 ? totalDeliveryFees / orders.length : 0,
    },
  };
}

async function getRetailerEarnings(userId: ObjectId, startDate: Date) {
  const retailerOrdersCollection = await getRetailerOrderCollection();

  const orders = await retailerOrdersCollection
    .find({
      retailerId: userId,
      status: "delivered",
      createdAt: { $gte: startDate },
    })
    .toArray();

  const totalSpent = orders.reduce(
    (sum: number, order) =>
      sum + order.totalAmount + (order.finalDeliveryFee || 0),
    0
  );

  const totalSavings = orders.reduce((sum: number, order) => {
    const deliveryDiscount = order.deliveryDiscount || 0;
    return sum + deliveryDiscount;
  }, 0);

  // Get subscription tier from metadata if available
  const subscriptionTier = "free";

  return {
    success: true,
    data: {
      totalRevenue: totalSpent, // For retailers, this represents total spending
      grossSales: totalSpent + totalSavings, // What they would have paid without discounts
      platformCommission: totalSavings, // For retailers, this represents savings
      totalOrders: orders.length,
      subscriptionTier,
      avgOrderValue: orders.length > 0 ? totalSpent / orders.length : 0,
    },
  };
}

/**
 * Get platform-wide earnings statistics (admin only)
 */
export async function getPlatformEarnings(
  period: "week" | "month" | "year" = "month"
) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const now = new Date();
    const startDate = new Date();
    if (period === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (period === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const ordersCollection = await getOrdersCollection();

    const orders = await ordersCollection
      .find({
        status: "delivered",
        createdAt: { $gte: startDate },
      })
      .toArray();

    const platformRevenue = orders.reduce(
      (sum, order) => sum + (order.platformRevenue || 0),
      0
    );
    const totalCommission = orders.reduce(
      (sum, order) => sum + (order.platformCommission || 0),
      0
    );
    const totalServiceFees = orders.reduce(
      (sum, order) => sum + (order.serviceFee || 0),
      0
    );
    const totalVolume = orders.reduce(
      (sum, order) => sum + order.quantity * order.pricePerUnit,
      0
    );

    return {
      success: true,
      data: {
        platformRevenue,
        totalCommission,
        totalServiceFees,
        totalOrders: orders.length,
        totalVolume,
        avgOrderValue: orders.length > 0 ? totalVolume / orders.length : 0,
      },
    };
  } catch (error) {
    console.error("Error fetching platform earnings:", error);
    return { success: false, error: "Failed to fetch platform earnings" };
  }
}
