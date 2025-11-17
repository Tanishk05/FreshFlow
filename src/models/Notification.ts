import client from "@/lib/db";
import { ObjectId, Db } from "mongodb";

export interface Notification {
  _id?: ObjectId;
  userId: ObjectId;
  alertId: string;
  type: "critical" | "warning" | "info" | "reminder";
  category: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  readAt?: Date;
  metadata?: Record<string, unknown>;
}

async function getDb(): Promise<Db> {
  const dbClient = await client;
  if (!process.env.MONGODB_DB) {
    throw new Error("MONGODB_DB environment variable is not set");
  }
  return dbClient.db(process.env.MONGODB_DB);
}

export async function getNotificationCollection() {
  const db = await getDb();
  return db.collection<Notification>("notifications");
}
