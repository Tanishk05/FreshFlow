import client from "@/lib/db";
import { ObjectId, Db } from "mongodb";

export interface AlertEmail {
  _id?: ObjectId;
  userId: ObjectId;
  alertId: string;
  email: string;
  sentAt: Date;
}

async function getDb(): Promise<Db> {
  const dbClient = await client;
  if (!process.env.MONGODB_DB) {
    throw new Error("MONGODB_DB environment variable is not set");
  }
  return dbClient.db(process.env.MONGODB_DB);
}

export async function getAlertEmailCollection() {
  const db = await getDb();
  return db.collection<AlertEmail>("alertEmails");
}
