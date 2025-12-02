import client from "@/lib/db";
import { ObjectId, Db } from "mongodb";

export type PointsTransactionType =
  | "earned_purchase"
  | "earned_referral"
  | "earned_bonus"
  | "redeemed"
  | "expired"
  | "adjusted";

export interface PointsTransaction {
  _id?: ObjectId;
  userId: ObjectId;
  type: PointsTransactionType;
  points: number; // Positive for earned, negative for redeemed/expired
  balance: number; // Balance after this transaction

  // Related data
  orderId?: ObjectId; // If earned from purchase
  referralUserId?: ObjectId; // If earned from referral
  redemptionValue?: number; // Rupee value if redeemed

  description: string;
  expiryDate?: Date; // When these points expire
  createdAt: Date;
}

export interface UserLoyaltyPoints {
  _id?: ObjectId;
  userId: ObjectId;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  currentBalance: number;
  tier: "bronze" | "silver" | "gold" | "platinum";

  // Tier benefits
  pointsMultiplier: number; // e.g., 1.5x for gold tier

  createdAt: Date;
  updatedAt: Date;
}

// Loyalty program configuration
export const LOYALTY_CONFIG = {
  // Points earning
  pointsPerRupee: 1, // ₹1 spent = 1 point
  redemptionRate: 0.1, // 100 points = ₹10 (0.1 rupee per point)
  minRedemptionPoints: 100,

  // Bonuses
  firstOrderBonus: 500,
  referralBonus: 1000,
  birthdayBonus: 250,

  // Tiers (based on total points earned)
  tiers: {
    bronze: {
      minPoints: 0,
      maxPoints: 4999,
      multiplier: 1.0,
      benefits: ["Standard earning rate", "Basic rewards"],
    },
    silver: {
      minPoints: 5000,
      maxPoints: 14999,
      multiplier: 1.25,
      benefits: ["1.25x points", "Priority support", "Free delivery on ₹1500+"],
    },
    gold: {
      minPoints: 15000,
      maxPoints: 49999,
      multiplier: 1.5,
      benefits: [
        "1.5x points",
        "VIP support",
        "Free delivery on ₹1000+",
        "Exclusive deals",
      ],
    },
    platinum: {
      minPoints: 50000,
      maxPoints: Infinity,
      multiplier: 2.0,
      benefits: [
        "2x points",
        "Dedicated manager",
        "Always free delivery",
        "Early access",
        "Custom deals",
      ],
    },
  },

  // Expiry
  pointsExpiryDays: 365, // Points expire after 1 year
};

// Helper functions
async function getDb(): Promise<Db> {
  const dbClient = await client;
  if (!process.env.MONGODB_DB) {
    throw new Error("MONGODB_DB environment variable is not set");
  }
  return dbClient.db(process.env.MONGODB_DB);
}

export async function getPointsTransactionsCollection() {
  const db = await getDb();
  return db.collection<PointsTransaction>("points_transactions");
}

export async function getUserLoyaltyPointsCollection() {
  const db = await getDb();
  return db.collection<UserLoyaltyPoints>("user_loyalty_points");
}

// Calculate tier based on total points earned
export function calculateTier(
  totalEarned: number
): "bronze" | "silver" | "gold" | "platinum" {
  const { tiers } = LOYALTY_CONFIG;

  if (totalEarned >= tiers.platinum.minPoints) return "platinum";
  if (totalEarned >= tiers.gold.minPoints) return "gold";
  if (totalEarned >= tiers.silver.minPoints) return "silver";
  return "bronze";
}

// Calculate points earned from purchase
export function calculatePointsFromPurchase(
  amount: number,
  tier: "bronze" | "silver" | "gold" | "platinum" = "bronze"
): number {
  const basePoints = amount * LOYALTY_CONFIG.pointsPerRupee;
  const multiplier = LOYALTY_CONFIG.tiers[tier].multiplier;
  return Math.floor(basePoints * multiplier);
}

// Calculate redemption value
export function calculateRedemptionValue(points: number): number {
  if (points < LOYALTY_CONFIG.minRedemptionPoints) return 0;
  return points * LOYALTY_CONFIG.redemptionRate;
}

// Get tier benefits
export function getTierBenefits(
  tier: "bronze" | "silver" | "gold" | "platinum"
) {
  return LOYALTY_CONFIG.tiers[tier];
}
