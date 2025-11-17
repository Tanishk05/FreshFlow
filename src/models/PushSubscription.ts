import client from "@/lib/db";
import { ObjectId, Db } from "mongodb";

export interface PushSubscription {
  _id?: ObjectId;
  userId: ObjectId;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  userAgent?: string;
  createdAt: Date;
  lastUsed?: Date;
}

async function getDb(): Promise<Db> {
  const dbClient = await client;
  if (!process.env.MONGODB_DB) {
    throw new Error("MONGODB_DB environment variable is not set");
  }
  return dbClient.db(process.env.MONGODB_DB);
}

export async function getPushSubscriptionCollection() {
  const db = await getDb();
  return db.collection<PushSubscription>("push_subscriptions");
}
