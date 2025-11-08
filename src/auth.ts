import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import client from "@/lib/db";
import authConfig from "./auth.config"; // Your default import

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig, // Spread the "lite" config
  adapter: MongoDBAdapter(client, {
    databaseName: process.env.MONGODB_DB, // Your DB name
  }),

  // --- THIS IS THE CRUCIAL FIX ---
  // Force the session strategy to "jwt".
  // This overrides the adapter's default ("database").
  session: { strategy: "jwt" },

  providers: [
    Google,
    Nodemailer({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
    }),
  ],

  // (Optional but highly recommended to get user ID in client)
  callbacks: {
    // This merges the callbacks from auth.config.ts
    ...authConfig.callbacks,

    // These callbacks put the user's DB ID into the JWT
    async jwt({ token, user }) {
      if (user) {
        // 'user' is the user object from the database
        token.id = user.id; // Add the DB user ID to the token
      }
      return token;
    },
    async session({ session, token }) {
      // 'token' is the JWT, 'session' is what the client sees
      if (session.user && token.id) {
        session.user.id = token.id as string; // Add the ID to the session
      }
      return session;
    },
  },
});
