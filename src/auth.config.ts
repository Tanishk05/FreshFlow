import type { NextAuthConfig } from "next-auth";

// This file must remain "Edge-safe" (no Node.js specific imports)
export default {
  providers: [], // We will add providers in auth.ts, not here
  // You can add standard callbacks here if they don't use database/crypto
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard"); // Example protected route
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
