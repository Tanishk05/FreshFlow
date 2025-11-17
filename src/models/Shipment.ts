import { Db, ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

export interface Shipment {
  _id?: ObjectId;
  farmerId: ObjectId;
  orderId?: ObjectId;
  origin: string;
  destination: string;
  status: "in-transit" | "delivered" | "delayed";
  temperatureC: number;
  eta: Date;
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

export async function getShipmentsCollection() {
  const database = await getDb();
  return database.collection<Shipment>("shipments");
}
