"use server";

import { requireAuth } from "@/services/auth.service";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import {
  getUserLoyaltyPointsCollection,
  getPointsTransactionsCollection,
  PointsTransaction,
  getTierBenefits,
  LOYALTY_CONFIG,
} from "@/models/LoyaltyPoints";

/**
 * Get user's loyalty points and tier information
 */
export async function getMyLoyaltyPoints() {
  try {
    const { userId } = await requireAuth();

    const loyaltyCollection = await getUserLoyaltyPointsCollection();
    const loyalty = await loyaltyCollection.findOne({
      userId: new ObjectId(userId),
    });

    if (!loyalty) {
      // Return initial state
      return {
        success: true,
        data: {
          currentPoints: 0,
          lifetimePoints: 0,
          tier: "bronze",
          tierBenefits: getTierBenefits("bronze"),
          nextTier: "silver",
          pointsToNextTier: LOYALTY_CONFIG.tiers.silver.minPoints,
          redemptionValue: 0,
        },
      };
    }

    const tierBenefits = getTierBenefits(loyalty.tier);
    const currentBalance =
      loyalty.totalEarned - loyalty.totalRedeemed - loyalty.totalExpired;
    const redemptionValue =
      (currentBalance / LOYALTY_CONFIG.redemptionRate) *
      (loyalty.tier === "platinum" ? 1.02 : 1);

    // Calculate points to next tier
    let nextTier: string | null = null;
    let pointsToNextTier = 0;

    if (loyalty.tier === "bronze") {
      nextTier = "silver";
      pointsToNextTier =
        LOYALTY_CONFIG.tiers.silver.minPoints - loyalty.totalEarned;
    } else if (loyalty.tier === "silver") {
      nextTier = "gold";
      pointsToNextTier =
        LOYALTY_CONFIG.tiers.gold.minPoints - loyalty.totalEarned;
    } else if (loyalty.tier === "gold") {
      nextTier = "platinum";
      pointsToNextTier =
        LOYALTY_CONFIG.tiers.platinum.minPoints - loyalty.totalEarned;
    }

    return {
      success: true,
      data: {
        ...loyalty,
        _id: loyalty._id?.toString(),
        userId: loyalty.userId.toString(),
        currentPoints: currentBalance,
        lifetimePoints: loyalty.totalEarned,
        tierBenefits,
        nextTier,
        pointsToNextTier: Math.max(0, pointsToNextTier),
        redemptionValue,
      },
    };
  } catch (error) {
    console.error("Error fetching loyalty points:", error);
    return { success: false, error: "Failed to fetch loyalty points" };
  }
}

/**
 * Get user's points transaction history
 */
export async function getPointsHistory(limit = 50) {
  try {
    const { userId } = await requireAuth();

    const transactionsCollection = await getPointsTransactionsCollection();
    const transactions = await transactionsCollection
      .find({ userId: new ObjectId(userId) })
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return {
      success: true,
      data: transactions.map((t) => ({
        ...t,
        _id: t._id?.toString(),
        userId: t.userId.toString(),
        orderId: t.orderId?.toString(),
      })),
    };
  } catch (error) {
    console.error("Error fetching points history:", error);
    return { success: false, error: "Failed to fetch points history" };
  }
}

/**
 * Redeem loyalty points
 */
export async function redeemPoints(orderId: string, pointsToRedeem: number) {
  try {
    const { userId } = await requireAuth();

    if (pointsToRedeem < LOYALTY_CONFIG.minRedemptionPoints) {
      return {
        success: false,
        error: `Minimum ${LOYALTY_CONFIG.minRedemptionPoints} points required for redemption`,
      };
    }

    const loyaltyCollection = await getUserLoyaltyPointsCollection();
    const loyalty = await loyaltyCollection.findOne({
      userId: new ObjectId(userId),
    });

    const currentBalance = loyalty
      ? loyalty.totalEarned - loyalty.totalRedeemed - loyalty.totalExpired
      : 0;
    if (!loyalty || currentBalance < pointsToRedeem) {
      return { success: false, error: "Insufficient points" };
    }

    // Calculate discount value
    const baseValue = pointsToRedeem / LOYALTY_CONFIG.redemptionRate;
    const discountValue =
      loyalty.tier === "platinum" ? baseValue * 1.02 : baseValue;

    // Deduct points
    await loyaltyCollection.updateOne(
      { userId: new ObjectId(userId) },
      {
        $inc: { totalRedeemed: pointsToRedeem },
        $set: { updatedAt: new Date() },
      }
    );

    // Record transaction
    const transactionsCollection = await getPointsTransactionsCollection();
    const newBalance = currentBalance - pointsToRedeem;
    const transaction: PointsTransaction = {
      userId: new ObjectId(userId),
      orderId: new ObjectId(orderId),
      type: "redeemed",
      points: pointsToRedeem,
      balance: newBalance,
      description: `Redeemed ${pointsToRedeem} points for ₹${discountValue.toFixed(
        2
      )} discount`,
      createdAt: new Date(),
    };

    await transactionsCollection.insertOne(transaction);

    revalidatePath("/dashboard");

    return {
      success: true,
      message: `Redeemed ${pointsToRedeem} points for ₹${discountValue} discount`,
      data: { discountValue },
    };
  } catch (error) {
    console.error("Error redeeming points:", error);
    return { success: false, error: "Failed to redeem points" };
  }
}

/**
 * Get loyalty program statistics (admin only)
 */
export async function getLoyaltyStats() {
  try {
    const { requireAdmin } = await import("@/services/auth.service");
    await requireAdmin();

    const loyaltyCollection = await getUserLoyaltyPointsCollection();
    const transactionsCollection = await getPointsTransactionsCollection();

    const [tierDistribution, totalPoints, recentActivity] = await Promise.all([
      loyaltyCollection
        .aggregate([
          {
            $group: {
              _id: "$tier",
              count: { $sum: 1 },
              totalPoints: { $sum: "$currentPoints" },
            },
          },
        ])
        .toArray(),
      loyaltyCollection
        .aggregate([
          { $group: { _id: null, total: { $sum: "$currentPoints" } } },
        ])
        .toArray(),
      transactionsCollection.find().sort({ createdAt: -1 }).limit(10).toArray(),
    ]);

    return {
      success: true,
      data: {
        tierDistribution: tierDistribution.reduce((acc, item) => {
          acc[item._id] = { count: item.count, totalPoints: item.totalPoints };
          return acc;
        }, {} as Record<string, { count: number; totalPoints: number }>),
        totalPointsIssued: totalPoints[0]?.total || 0,
        recentActivity: recentActivity.map((t) => ({
          ...t,
          _id: t._id?.toString(),
          userId: t.userId.toString(),
          orderId: t.orderId?.toString(),
        })),
      },
    };
  } catch (error) {
    console.error("Error fetching loyalty stats:", error);
    return { success: false, error: "Failed to fetch loyalty stats" };
  }
}
