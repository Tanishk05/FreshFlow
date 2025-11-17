import client from "@/lib/db";
import { ObjectId, Db } from "mongodb";

// Order status types
export type OrderStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "cancelled";

// Define the Order interface
export interface Order {
  _id?: ObjectId;
  farmerId: ObjectId; // Reference to the farmer who owns the produce
  retailerId?: ObjectId; // Reference to the retailer who placed the order (optional for now)
  produceId: ObjectId; // Reference to the produce item
  produceName: string;
  quantity: number;
  unit: "kg" | "tons" | "bags";
  pricePerUnit: number;
  totalPrice: number;
  status: OrderStatus;
  orderDate: Date;
  deliveryDate?: Date;
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
