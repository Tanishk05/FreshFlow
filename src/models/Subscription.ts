import client from "@/lib/db";
import { ObjectId, Db } from "mongodb";

export type SubscriptionTier =
  | "free"
  | "pro"
  | "premium"
  | "business"
  | "enterprise";
export type SubscriptionUserType = "farmer" | "retailer";
export type SubscriptionStatus = "active" | "cancelled" | "expired" | "trial";

export interface Subscription {
  _id?: ObjectId;
  userId: ObjectId;
  userType: SubscriptionUserType;
  tier: SubscriptionTier;
  status: SubscriptionStatus;

  // Pricing
  monthlyPrice: number;
  discountRate: number; // e.g., 0.05 for 5% discount on products
  commissionRate: number; // e.g., 0.03 for 3% platform commission

  // Features
  features: string[]; // List of features included
  maxOrders?: number; // Max orders per day/month (null = unlimited)
  prioritySupport: boolean;
  featuredListing: boolean;
  analyticsAccess: boolean;

  // Billing
  startDate: Date;
  endDate: Date;
  nextBillingDate: Date;
  autoRenew: boolean;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

// Subscription plan definitions
export const SUBSCRIPTION_PLANS = {
  farmer: {
    free: {
      tier: "free" as SubscriptionTier,
      name: "Free Plan",
      monthlyPrice: 0,
      discountRate: 0,
      commissionRate: 0.05, // 5%
      features: [
        "Basic listing",
        "Up to 10 products",
        "Standard support",
        "Basic analytics",
      ],
      maxOrders: null,
      prioritySupport: false,
      featuredListing: false,
      analyticsAccess: false,
    },
    pro: {
      tier: "pro" as SubscriptionTier,
      name: "Pro Plan",
      monthlyPrice: 999,
      discountRate: 0,
      commissionRate: 0.03, // 3%
      features: [
        "Featured listing",
        "Unlimited products",
        "Priority support",
        "Advanced analytics",
        "2% lower commission",
      ],
      maxOrders: null,
      prioritySupport: true,
      featuredListing: true,
      analyticsAccess: true,
    },
    premium: {
      tier: "premium" as SubscriptionTier,
      name: "Premium Plan",
      monthlyPrice: 2499,
      discountRate: 0,
      commissionRate: 0.02, // 2%
      features: [
        "Top featured listing",
        "Unlimited products",
        "Dedicated support",
        "Advanced analytics",
        "Marketing tools",
        "3% lower commission",
        "Priority delivery slots",
      ],
      maxOrders: null,
      prioritySupport: true,
      featuredListing: true,
      analyticsAccess: true,
    },
  },
  retailer: {
    free: {
      tier: "free" as SubscriptionTier,
      name: "Free Plan",
      monthlyPrice: 0,
      discountRate: 0,
      commissionRate: 0,
      features: ["Standard pricing", "Up to 5 orders/day", "Basic support"],
      maxOrders: 5,
      prioritySupport: false,
      featuredListing: false,
      analyticsAccess: false,
    },
    business: {
      tier: "business" as SubscriptionTier,
      name: "Business Plan",
      monthlyPrice: 1499,
      discountRate: 0.05, // 5% discount on products
      commissionRate: 0,
      features: [
        "5% discount on all products",
        "Unlimited orders",
        "Bulk order management",
        "Priority delivery slots",
        "Priority support",
      ],
      maxOrders: null,
      prioritySupport: true,
      featuredListing: false,
      analyticsAccess: true,
    },
    enterprise: {
      tier: "enterprise" as SubscriptionTier,
      name: "Enterprise Plan",
      monthlyPrice: 4999,
      discountRate: 0.1, // 10% discount on products
      commissionRate: 0,
      features: [
        "10% discount on all products",
        "Unlimited orders",
        "Credit facility (30-day terms)",
        "Dedicated distributor",
        "Custom pricing",
        "Dedicated support",
        "Advanced analytics",
      ],
      maxOrders: null,
      prioritySupport: true,
      featuredListing: false,
      analyticsAccess: true,
    },
  },
};

// Helper function to get the database
async function getDb(): Promise<Db> {
  const dbClient = await client;
  if (!process.env.MONGODB_DB) {
    throw new Error("MONGODB_DB environment variable is not set");
  }
  return dbClient.db(process.env.MONGODB_DB);
}

// Helper function to get the subscriptions collection
export async function getSubscriptionsCollection() {
  const db = await getDb();
  return db.collection<Subscription>("subscriptions");
}

// Get subscription plan details
export function getSubscriptionPlan(
  userType: SubscriptionUserType,
  tier: SubscriptionTier
) {
  return SUBSCRIPTION_PLANS[userType][
    tier as keyof (typeof SUBSCRIPTION_PLANS)[typeof userType]
  ];
}

// Calculate subscription benefits
export function calculateSubscriptionBenefits(
  userType: SubscriptionUserType,
  tier: SubscriptionTier,
  orderValue: number
) {
  const plan = getSubscriptionPlan(userType, tier);
  if (!plan) return { discount: 0, savings: 0 };

  const discount = orderValue * plan.discountRate;
  return {
    discount,
    savings: discount,
    discountRate: plan.discountRate,
    commissionRate: plan.commissionRate,
  };
}
