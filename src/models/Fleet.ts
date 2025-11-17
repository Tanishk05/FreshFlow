import { Db, ObjectId } from "mongodb";
import clientPromise from "@/lib/db";

export type TruckStatus = "available" | "on-route" | "maintenance" | "offline";

export interface Fleet {
  _id?: ObjectId;
  distributorId: ObjectId;
  truckNumber: string;
  driver: string;
  driverContact: string;
  status: TruckStatus;
  currentLocation?: string;
  destination?: string;
  assignedOrderIds?: ObjectId[]; // Multiple orders can be assigned to one truck
  temperatureC?: number;
  eta?: Date;
  capacityKg: number; // Total capacity in kilograms (e.g., 10000 kg)
  currentLoadKg: number; // Current load in kilograms
  createdAt: Date;
  updatedAt: Date;
}

// Serialized version for client components (ObjectIds converted to strings)
export interface FleetSerialized {
  _id?: string;
  distributorId: string;
  truckNumber: string;
  driver: string;
  driverContact: string;
  status: TruckStatus;
  currentLocation?: string;
  destination?: string;
  assignedOrderIds?: string[]; // Multiple orders can be assigned to one truck
  temperatureC?: number;
  eta?: Date;
  capacityKg: number; // Total capacity in kilograms
  currentLoadKg: number; // Current load in kilograms
  availableCapacityKg?: number; // Calculated: capacityKg - currentLoadKg
  loadPercentage?: number; // Calculated: (currentLoadKg / capacityKg) * 100
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

export async function getFleetCollection() {
  const database = await getDb();
  return database.collection<Fleet>("fleet");
}
