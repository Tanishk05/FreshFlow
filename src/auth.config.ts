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
    async jwt({ token, user, account, trigger }) {
      // On initial sign-in, add fields from the user object
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
        const dbUser = user as DbUser;
        token.role = dbUser.role;
        token.isAdmin = dbUser.isAdmin || false;
        // IMPORTANT: Strip potentially large fields (like base64 avatar) to keep JWT small
        if (
          token.picture &&
          typeof token.picture === "string" &&
          token.picture.startsWith("data:image")
        ) {
          delete token.picture;
        }
        if (
          token.image &&
          typeof token.image === "string" &&
          token.image.startsWith("data:image")
        ) {
          delete token.image;
        }
        return token;
      }

      // If trigger is 'update', always fetch fresh data from database
      // This happens when update() is called manually (e.g., after profile save)
      const shouldFetchFromDb = trigger === "update" || !token.role;

      // Fetch from database if needed
      if (shouldFetchFromDb && token.id) {
        try {
          const usersCollection = await getUsersCollection();
          const dbUser = await usersCollection.findOne({
            _id: new ObjectId(token.id as string),
          });
          if (dbUser?.role) {
            token.role = dbUser.role;
            token.isAdmin = dbUser.isAdmin || false;
          }
          // Update name and username from database
          if (dbUser?.name) {
            token.name = dbUser.name;
          }
          if (dbUser?.username) {
            token.username = dbUser.username;
          }
          // Update avatar URL from database (e.g., after profile update)
          if (dbUser?.image && typeof dbUser.image === "string") {
            // Only store Cloudinary URLs or http(s) URLs, not base64
            if (dbUser.image.startsWith("http")) {
              token.picture = dbUser.image;
            }
          }
          // Also ensure any large image data fetched later is not persisted in token
          if (
            token.picture &&
            typeof token.picture === "string" &&
            token.picture.startsWith("data:image")
          ) {
            delete token.picture;
          }
          if (
            token.image &&
            typeof token.image === "string" &&
            token.image.startsWith("data:image")
          ) {
            delete token.image;
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
        session.user.isAdmin = token.isAdmin as boolean;
        // Include name and username in session
        if (token.name && typeof token.name === "string") {
          session.user.name = token.name;
        }
        if (token.username && typeof token.username === "string") {
          // @ts-expect-error - username is a custom field
          session.user.username = token.username;
        }
        // Ensure image (avatar URL) is included in session
        if (token.picture && typeof token.picture === "string") {
          session.user.image = token.picture;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
