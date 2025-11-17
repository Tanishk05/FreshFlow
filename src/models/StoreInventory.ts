import { Db, ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

export interface StoreInventory {
  _id?: ObjectId;
  retailerId: ObjectId;
  name: string;
  stock: number;
  reorderPoint: number;
  shelfLifeDays: number; // Days remaining
  status: "fresh" | "expiring" | "spoiled";
  purchaseDate: Date;
  expiryDate: Date;
  price: number;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

let db: Db | null = null;

async function getDb() {
  if (!db) {
    const client = await clientPromise;
    db = client.db("freshflow");
  }
  return db;
}

export async function getStoreInventoryCollection() {
  const database = await getDb();
  return database.collection<StoreInventory>("store_inventory");
}
