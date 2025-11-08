import type { NextAuthConfig } from "next-auth";

export default {
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboards");

      // --- 1. Define the homepage ---
      const isOnHomepage = nextUrl.pathname === "/";

      // --- 2. Protect the dashboard ---
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        // Not logged in, trying to access dashboard: redirect to home
        return Response.redirect(new URL("/", nextUrl));
      }

      // --- 3. Add your new rule ---
      if (isLoggedIn && isOnHomepage) {
        // Logged in and on homepage: redirect to dashboard
        return Response.redirect(new URL("/dashboards/farmer", nextUrl));
      }

      // Allow all other requests (like /login, or /pricing, etc.)
      return true;
    },
  },
} satisfies NextAuthConfig;
