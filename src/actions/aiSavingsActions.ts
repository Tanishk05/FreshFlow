"use server";

import { getRetailerOrderCollection } from "@/models/RetailerOrder";
import { getOrdersCollection } from "@/models/Order";
import { ObjectId } from "mongodb";

/**
 * Calculate AI Savings for Distributor Dashboard
 * - Fuel Reduction: Based on optimized routes (delivery fee savings from distance optimization)
 * - Spoilage Reduction: Based on successful deliveries maintaining cold chain
 */
export async function calculateDistributorAISavings(distributorId: string) {
  try {
    const retailerOrdersCollection = await getRetailerOrderCollection();
    const distributorObjId = new ObjectId(distributorId);

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all delivered orders for this month
    const deliveredOrders = await retailerOrdersCollection
      .find({
        distributorId: distributorObjId,
        status: "delivered",
        deliveryDate: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      })
      .toArray();

    // Calculate Fuel Reduction Savings
    // AI optimizes routes, saving ~15% on average delivery fee
    // This is the savings compared to non-optimized routing
    const totalDeliveryFees = deliveredOrders.reduce(
      (sum, order) => sum + (order.deliveryFee || 0),
      0
    );
    const fuelReductionSavings = totalDeliveryFees * 0.15; // 15% savings from AI route optimization

    // Calculate Spoilage Reduction Savings
    // AI maintains optimal cold chain, preventing ~8% spoilage
    // Calculate 8% of total delivered goods value
    const totalGoodsValue = deliveredOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    const spoilageReductionSavings = totalGoodsValue * 0.08; // 8% of goods that would have spoiled

    const totalSavings = fuelReductionSavings + spoilageReductionSavings;

    return {
      success: true,
      savings: {
        total: totalSavings,
        fromSpoilageReduction: spoilageReductionSavings,
        fromFuelReduction: fuelReductionSavings,
      },
      metadata: {
        deliveredOrdersCount: deliveredOrders.length,
        totalDeliveryFees,
        totalGoodsValue,
        monthStart: startOfMonth.toISOString(),
        monthEnd: endOfMonth.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error calculating distributor AI savings:", error);
    return {
      success: false,
      savings: {
        total: 0,
        fromSpoilageReduction: 0,
        fromFuelReduction: 0,
      },
      error: "Failed to calculate AI savings",
    };
  }
}

/**
 * Calculate AI Savings for Retailer Dashboard
 * - Dynamic Pricing: Revenue gained from AI-suggested pricing
 * - Spoilage Reduction: Savings from AI inventory management preventing waste
 */
export async function calculateRetailerAISavings(retailerId: string) {
  try {
    const retailerOrdersCollection = await getRetailerOrderCollection();
    const retailerObjId = new ObjectId(retailerId);

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all delivered orders for this month
    const deliveredOrders = await retailerOrdersCollection
      .find({
        retailerId: retailerObjId,
        status: "delivered",
        deliveryDate: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      })
      .toArray();

    // Calculate total goods received
    const totalGoodsValue = deliveredOrders.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );

    // Dynamic Pricing Savings
    // AI helps price goods optimally based on freshness, demand, competition
    // Average 3-5% margin improvement on sales
    const dynamicPricingSavings = totalGoodsValue * 0.04; // 4% revenue lift from dynamic pricing

    // Spoilage Reduction Savings
    // AI inventory management prevents ~12% spoilage through:
    // - Demand forecasting for optimal ordering
    // - FIFO/FEFO recommendations
    // - Dynamic pricing for near-expiry items
    const spoilageReductionSavings = totalGoodsValue * 0.12; // 12% of goods that would have spoiled

    const totalSavings = dynamicPricingSavings + spoilageReductionSavings;

    return {
      success: true,
      savings: {
        total: totalSavings,
        fromSpoilageReduction: spoilageReductionSavings,
        fromDynamicPricing: dynamicPricingSavings,
      },
      metadata: {
        deliveredOrdersCount: deliveredOrders.length,
        totalGoodsValue,
        monthStart: startOfMonth.toISOString(),
        monthEnd: endOfMonth.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error calculating retailer AI savings:", error);
    return {
      success: false,
      savings: {
        total: 0,
        fromSpoilageReduction: 0,
        fromDynamicPricing: 0,
      },
      error: "Failed to calculate AI savings",
    };
  }
}

/**
 * Calculate AI Savings for Farmer Dashboard
 * - Spoilage Reduction: Savings from AI harvest planning and demand matching
 */
export async function calculateFarmerAISavings(farmerId: string) {
  try {
    const ordersCollection = await getOrdersCollection();
    const farmerObjId = new ObjectId(farmerId);

    // Get current month date range
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get all approved/completed orders for this month
    const completedOrders = await ordersCollection
      .find({
        farmerId: farmerObjId,
        status: { $in: ["approved", "completed"] },
        createdAt: {
          $gte: startOfMonth,
          $lte: endOfMonth,
        },
      })
      .toArray();

    // Calculate total revenue from orders
    const totalRevenue = completedOrders.reduce(
      (sum, order) => sum + order.totalPrice,
      0
    );

    // Spoilage Reduction Savings
    // AI helps farmers:
    // - Match harvest timing with demand
    // - Connect with buyers before harvest
    // - Plan quantities based on market forecast
    // This prevents ~10% of produce from going to waste
    const spoilageReductionSavings = totalRevenue * 0.1; // 10% that would have been wasted

    return {
      success: true,
      savings: {
        total: spoilageReductionSavings,
        fromSpoilageReduction: spoilageReductionSavings,
      },
      metadata: {
        completedOrdersCount: completedOrders.length,
        totalRevenue,
        monthStart: startOfMonth.toISOString(),
        monthEnd: endOfMonth.toISOString(),
      },
    };
  } catch (error) {
    console.error("Error calculating farmer AI savings:", error);
    return {
      success: false,
      savings: {
        total: 0,
        fromSpoilageReduction: 0,
      },
      error: "Failed to calculate AI savings",
    };
  }
}
