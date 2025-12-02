import { Db, ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

export type RetailerOrderStatus =
  | "pending"
  | "assigned"
  | "in-transit"
  | "delivered"
  | "cancelled";

export interface RetailerOrderItem {
  produceId: ObjectId;
  name: string;
  quantity: number; // in kg
  pricePerUnit: number;
}

export interface RetailerOrder {
  _id?: ObjectId;
  retailerId: ObjectId;
  distributorId: ObjectId;
  items: RetailerOrderItem[];
  totalAmount: number; // Total produce cost (goes to farmer)
  deliveryFee: number; // Delivery charge (goes to distributor)
  totalWeightKg: number; // Total weight of all items in kg
  distance?: number; // Distance in km
  status: RetailerOrderStatus;
  destination: string;
  deliveryAddress: string;
  assignedTruckId?: ObjectId;
  orderDate: Date;
  estimatedDelivery?: Date;
  deliveryDate?: Date; // Actual delivery date when status becomes 'delivered'
  createdAt: Date;
  updatedAt: Date;
  estimatedTime?: number; // Estimated time in seconds
  estimatedTimeText?: string; // Human readable estimated time
}

// Serialized version for client components (ObjectIds converted to strings)
export interface RetailerOrderSerialized {
  _id?: string;
  retailerId: string;
  distributorId: string;
  items: Array<{
    produceId: string;
    name: string;
    quantity: number; // in kg
    pricePerUnit: number;
  }>;
  totalAmount: number; // Total produce cost (goes to farmer)
  deliveryFee: number; // Delivery charge (goes to distributor)
  totalWeightKg: number; // Total weight of all items in kg
  distance?: number; // Distance in km
  status: RetailerOrderStatus;
  destination: string;
  deliveryAddress: string;
  assignedTruckId?: string;
  orderDate: Date;
  estimatedDelivery?: Date;
  deliveryDate?: Date; // Actual delivery date when status becomes 'delivered'
  createdAt: Date;
  updatedAt: Date;
  estimatedTime?: number; // Estimated time in seconds
  estimatedTimeText?: string; // Human readable estimated time
  retailerName?: string;
}

let db: Db | null = null;

async function getDb() {
  if (!db) {
    const client = await clientPromise;
    db = client.db("freshflow");
  }
  return db;
}

export async function getRetailerOrderCollection() {
  const database = await getDb();
  return database.collection<RetailerOrder>("retailer_orders");
}
