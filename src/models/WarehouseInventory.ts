import { Db, ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

export interface WarehouseInventory {
  _id?: ObjectId;
  distributorId: ObjectId;
  name: string;
  lotNumber: string;
  quantity: number; // in pallets
  tempZone: "Ambient" | "Cold (2-4°C)" | "Frozen";
  receivedDate: Date;
  farmerId?: ObjectId;
  category?: string;
  status: "in-stock" | "allocated" | "dispatched";
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

export async function getWarehouseInventoryCollection() {
  const database = await getDb();
  return database.collection<WarehouseInventory>("warehouse_inventory");
}
