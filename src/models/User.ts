import client from "@/lib/db";
import { ObjectId, Db } from "mongodb";

// 1. Define the User Role type
export type UserRole = "farmer" | "distributor" | "retailer";

// 2. Define the User interface
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

  // These are managed by the NextAuth MongoDBAdapter
  // You generally don't need to touch them, but they exist
  accounts?: unknown[];
  sessions?: unknown[];
}

// 3. Helper function to get the database
async function getDb(): Promise<Db> {
  const dbClient = await client;
  if (!process.env.MONGODB_DB) {
    throw new Error("MONGODB_DB environment variable is not set");
  }
  return dbClient.db(process.env.MONGODB_DB);
}

// 4. Helper function to get the 'users' collection with the correct type
export async function getUsersCollection() {
  const db = await getDb();
  return db.collection<User>("users");
}
