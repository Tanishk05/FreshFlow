"use server";

import { auth } from "@/auth";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import {
  getSubscriptionsCollection,
  Subscription,
  SubscriptionTier,
  SubscriptionUserType,
  SUBSCRIPTION_PLANS,
  getSubscriptionPlan,
} from "@/models/Subscription";

/**
 * Get current user's subscription
 */
export async function getMySubscription() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const subscriptionsCollection = await getSubscriptionsCollection();
    const subscription = await subscriptionsCollection.findOne({
      userId: new ObjectId(session.user.id),
      status: "active",
    });

    if (!subscription) {
      // Return free plan details
      const userType =
        (session.user.role as SubscriptionUserType) || "retailer";
      const freePlan = getSubscriptionPlan(userType, "free");

      return {
        success: true,
        data: {
          status: "active",
          ...freePlan,
          isFreePlan: true,
        },
      };
    }

    return {
      success: true,
      data: {
        ...subscription,
        _id: subscription._id?.toString(),
        userId: subscription.userId.toString(),
        isFreePlan: false,
      },
    };
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return { success: false, error: "Failed to fetch subscription" };
  }
}

/**
 * Get all available subscription plans for user type
 */
export async function getAvailablePlans() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userType = (session.user.role as SubscriptionUserType) || "retailer";
    const plans = SUBSCRIPTION_PLANS[userType];

    return {
      success: true,
      data: Object.values(plans),
    };
  } catch (error) {
    console.error("Error fetching plans:", error);
    return { success: false, error: "Failed to fetch plans" };
  }
}

/**
 * Subscribe to a plan
 */
export async function subscribeToPlan(tier: SubscriptionTier) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userType = (session.user.role as SubscriptionUserType) || "retailer";
    const plan = getSubscriptionPlan(userType, tier);

    if (!plan) {
      return { success: false, error: "Invalid plan" };
    }

    if (tier === "free") {
      return { success: false, error: "Cannot subscribe to free plan" };
    }

    const subscriptionsCollection = await getSubscriptionsCollection();

    // Cancel any existing active subscription
    await subscriptionsCollection.updateMany(
      {
        userId: new ObjectId(session.user.id),
        status: "active",
      },
      {
        $set: {
          status: "cancelled",
          cancelledAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    // Create new subscription
    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1); // 1 month subscription

    const subscription: Subscription = {
      userId: new ObjectId(session.user.id),
      userType,
      tier,
      status: "active",
      monthlyPrice: plan.monthlyPrice,
      discountRate: plan.discountRate,
      commissionRate: plan.commissionRate,
      features: plan.features,
      maxOrders: plan.maxOrders || undefined,
      prioritySupport: plan.prioritySupport,
      featuredListing: plan.featuredListing,
      analyticsAccess: plan.analyticsAccess,
      startDate,
      endDate,
      nextBillingDate: endDate,
      autoRenew: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await subscriptionsCollection.insertOne(subscription);

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return {
      success: true,
      message: `Successfully subscribed to ${plan.name}`,
    };
  } catch (error) {
    console.error("Error subscribing to plan:", error);
    return { success: false, error: "Failed to subscribe to plan" };
  }
}

/**
 * Cancel subscription
 */
export async function cancelSubscription() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const subscriptionsCollection = await getSubscriptionsCollection();

    const result = await subscriptionsCollection.updateOne(
      {
        userId: new ObjectId(session.user.id),
        status: "active",
      },
      {
        $set: {
          status: "cancelled",
          autoRenew: false,
          cancelledAt: new Date(),
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return { success: false, error: "No active subscription found" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return {
      success: true,
      message:
        "Subscription cancelled successfully. You can continue using premium features until the end of your billing period.",
    };
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return { success: false, error: "Failed to cancel subscription" };
  }
}

/**
 * Get subscription statistics
 */
export async function getSubscriptionStats() {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.isAdmin) {
      return { success: false, error: "Unauthorized" };
    }

    const subscriptionsCollection = await getSubscriptionsCollection();

    const [totalSubscriptions, activeSubscriptions, revenue] =
      await Promise.all([
        subscriptionsCollection.countDocuments({
          status: { $in: ["active", "trial"] },
        }),
        subscriptionsCollection.countDocuments({ status: "active" }),
        subscriptionsCollection
          .aggregate([
            { $match: { status: "active" } },
            { $group: { _id: null, total: { $sum: "$monthlyPrice" } } },
          ])
          .toArray(),
      ]);

    const tierBreakdown = await subscriptionsCollection
      .aggregate([
        { $match: { status: "active" } },
        { $group: { _id: "$tier", count: { $sum: 1 } } },
      ])
      .toArray();

    return {
      success: true,
      data: {
        totalSubscriptions,
        activeSubscriptions,
        monthlyRevenue: revenue[0]?.total || 0,
        tierBreakdown: tierBreakdown.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
      },
    };
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    return { success: false, error: "Failed to fetch subscription stats" };
  }
}
