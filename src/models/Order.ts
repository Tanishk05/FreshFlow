import client from "@/lib/db";
import { ObjectId, Db } from "mongodb";

// Order status types
export type OrderStatus =
  | "pending"
  | "approved"
  | "assigned"
  | "picked-up"
  | "in-transit"
  | "delivered"
  | "rejected"
  | "cancelled";

// Subscription tier types
export type SubscriptionTier =
  | "free"
  | "pro"
  | "premium"
  | "business"
  | "enterprise";

// Define the Order interface
export interface Order {
  _id?: ObjectId;
  farmerId: ObjectId; // Reference to the farmer who owns the produce
  retailerId?: ObjectId; // Reference to the retailer who placed the order (optional for now)
  distributorId?: ObjectId; // Reference to the distributor assigned to deliver
  produceId: ObjectId; // Reference to the produce item
  produceName: string;
  quantity: number;
  unit: "kg" | "tons" | "bags";
  pricePerUnit: number;
  totalPrice: number; // Product price × quantity

  // Pricing breakdown
  platformCommission?: number; // Platform fee (percentage of totalPrice)
  serviceFee?: number; // Fixed service fee per order
  deliveryFee?: number; // Original delivery fee before discounts
  deliveryDiscount?: number; // Delivery discount applied
  finalDeliveryFee?: number; // Final delivery fee after discount
  subscriptionDiscount?: number; // Discount from subscription tier
  bulkDiscount?: number; // Discount from bulk ordering

  // Revenue distribution
  farmerRevenue?: number; // Amount farmer receives
  distributorRevenue?: number; // Amount distributor receives
  platformRevenue?: number; // Amount platform earns

  // Subscription and loyalty
  retailerSubscriptionTier?: SubscriptionTier;
  loyaltyPointsEarned?: number;

  destination?: string; // Destination city/area
  deliveryAddress?: string; // Full delivery address
  distance?: number; // Distance in km
  estimatedTime?: number; // Estimated time in seconds
  estimatedTimeText?: string; // Human readable estimated time
  status: OrderStatus;
  orderDate: Date;
  deliveryDate?: Date;
  estimatedDelivery?: Date;
  assignedTruckId?: ObjectId; // Reference to the truck assigned for delivery
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Helper function to get the database
async function getDb(): Promise<Db> {
  const dbClient = await client;
  if (!process.env.MONGODB_DB) {
    throw new Error("MONGODB_DB environment variable is not set");
  }
  return dbClient.db(process.env.MONGODB_DB);
}

// Helper function to get the 'orders' collection with the correct type
export async function getOrdersCollection() {
  const db = await getDb();
  return db.collection<Order>("orders");
}
