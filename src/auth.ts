import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";
import authConfig from "./auth.config"; // Your "lite" config
import Sendgrid from "next-auth/providers/sendgrid";
import Nodemailer from "next-auth/providers/nodemailer";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,

  adapter: MongoDBAdapter(client, {
    databaseName: process.env.MONGODB_DB,
  }),

  // Add email providers here so they use the adapter
  providers: [
    ...authConfig.providers,
    process.env.NEXT_PRODUCTION === "true" && process.env.SENDGRID_API_KEY
      ? Sendgrid({ from: process.env.EMAIL_FROM })
      : Nodemailer({
          server: process.env.EMAIL_SERVER,
          from: process.env.EMAIL_FROM,
        }),
  ],
});
