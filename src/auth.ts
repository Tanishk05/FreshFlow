import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";
import authConfig from "./auth.config"; // Your "lite" config

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // 1. Spread the lite config (callbacks, session strategy, Google, Credentials)

  // 2. Add the adapter
  adapter: MongoDBAdapter(client, {
    databaseName: process.env.MONGODB_DB,
  }),

  // 3. Providers are already defined in authConfig (Google, Credentials)
  providers: authConfig.providers,
});
