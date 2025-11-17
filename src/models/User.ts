import client from "@/lib/db";
import { ObjectId, Db } from "mongodb";

// 1. Define the User Role type
export type UserRole = "farmer" | "distributor" | "retailer";

// 2. Define address and location interface
export interface UserAddress {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

// 3. Define the User interface
// This combines NextAuth's default fields with your custom fields
export interface User {
  _id: ObjectId;
  name?: string | null;
  username?: string | null; // Your custom field
  email: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  phone?: string | null; // Your custom field
  role?: UserRole | null; // Your custom field
  address?: UserAddress; // Address with coordinates

  // These are managed by the NextAuth MongoDBAdapter
  // You generally don't need to touch them, but they exist
  accounts?: unknown[];
  sessions?: unknown[];
}

// 4. Helper function to get the database
async function getDb(): Promise<Db> {
  const dbClient = await client;
  if (!process.env.MONGODB_DB) {
    throw new Error("MONGODB_DB environment variable is not set");
  }
  return dbClient.db(process.env.MONGODB_DB);
}

// 5. Helper function to get the 'users' collection with the correct type
export async function getUsersCollection() {
  const db = await getDb();
  return db.collection<User>("users");
}

// 6. Utility function to calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}
