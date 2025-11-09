import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";
import authConfig from "./auth.config"; // Your "lite" config
import Nodemailer from "next-auth/providers/nodemailer"; // <-- Import Nodemailer here

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // 1. Spread the lite config (callbacks, session strategy, Google)

  // 2. Add the adapter
  adapter: MongoDBAdapter(client, {
    databaseName: process.env.MONGODB_DB,
  }),

  // 3. Add the providers that need the adapter
  providers: [
    ...authConfig.providers, // (This is [Google] from the lite config)
    Nodemailer({
      // (This is the adapter-dependent one)
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],
});
