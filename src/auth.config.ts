import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { User as DbUser } from "@/models/User";
import { authorizeUser } from "@/lib/auth-handlers";
import { getUsersCollection } from "@/models/User";
import { ObjectId } from "mongodb";

export default {
  // 1. Add session strategy
  session: { strategy: "jwt" },

  // 2. Add providers that DON'T need an adapter
  providers: [Google],

  // 3. Add ALL callbacks
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role as string | null;

      return authorizeUser({ isLoggedIn, userRole, nextUrl });
    },

    // This 'jwt' callback adds your custom fields to the token
    async jwt({ token, user, account }) {
      // On initial sign-in, add fields from the user object
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
        const dbUser = user as DbUser;
        token.role = dbUser.role;
        return token;
      }

      // If token already has a role, return it (most common case)
      if (token.role) {
        return token;
      }

      // If no role in token but we have an ID, fetch from database
      // This handles the case where user completed signup and we need to refresh the token
      if (token.id) {
        try {
          const usersCollection = await getUsersCollection();
          const dbUser = await usersCollection.findOne({
            _id: new ObjectId(token.id as string),
          });
          if (dbUser?.role) {
            token.role = dbUser.role;
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }

      return token;
    },

    // This 'session' callback copies fields from the token to the client-side session
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string | null;
        session.user.provider = token.provider as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
