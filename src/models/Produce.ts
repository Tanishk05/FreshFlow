import client from "@/lib/db";
import { ObjectId, Db } from "mongodb";

// Define the Produce interface
export interface Produce {
  _id?: ObjectId;
  userId: ObjectId; // Reference to the user (farmer) who owns this produce
  name: string;
  category: "vegetable" | "fruit" | "grain" | "herb";
  quantity: number;
  unit: "kg" | "tons" | "bags";
  pricePerUnit: number;
  image: string;
  isVisible: boolean;
  isAvailable: boolean;
  harvestDate: string;
  shelfLifeDays: number;
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

// Helper function to get the 'produce' collection with the correct type
export async function getProduceCollection() {
  const db = await getDb();
  return db.collection<Produce>("produce");
}
