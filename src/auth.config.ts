import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google"; // <-- ADD Google here
import { User as DbUser } from "@/models/User"; // Import your user model

export default {
  // 1. Add session strategy
  session: { strategy: "jwt" },

  // 2. Add providers that DON'T need an adapter
  providers: [Google],

  // 3. Add ALL callbacks
  callbacks: {
    // --- THIS IS THE UPDATED 'authorized' CALLBACK ---
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const userRole = auth?.user?.role as string | null;

      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isCompleteSignupPage =
        nextUrl.pathname.startsWith("/complete-signup");
      const isOnHomepage = nextUrl.pathname === "/";

      // --- 1. User is not logged in ---
      if (!isLoggedIn) {
        if (isOnDashboard || isCompleteSignupPage) {
          // Not logged in, trying to access protected page: redirect to home
          return Response.redirect(new URL("/", nextUrl));
        }
        // Allow access to homepage or any other public route
        return true;
      }

      // --- 2. User is logged in ---
      if (!userRole && !isCompleteSignupPage) {
        // Logged in but has no role? Force them to complete signup.
        return Response.redirect(new URL("/complete-signup", nextUrl));
      }

      if (userRole && isCompleteSignupPage) {
        // Logged in *with* a role but still on the signup page?
        // Send them to their *default* dashboard.
        return Response.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
      }

      if (userRole && isOnHomepage) {
        // Logged in with role and on homepage? Redirect to their *default* dashboard
        return Response.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
      }

      // --- 3. NEW ROLE PROTECTION LOGIC ---
      if (isOnDashboard) {
        // User is logged in, has a role, and is on a dashboard page.
        // Check if the dashboard path matches their role.
        if (nextUrl.pathname.startsWith(`/dashboard/${userRole}`)) {
          // Path matches role (e.g., farmer on /dashboards/farmer). Allow.
          return true;
        } else {
          // Path does NOT match role (e.g., farmer on /dashboards/retailer).
          // Redirect them back to their own dashboard.
          return Response.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
        }
      }

      // Allow all other cases (e.g., logged in user on /settings page)
      return true;
    },

    // This 'jwt' callback adds your custom fields to the token
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.provider = account?.provider;
        const dbUser = user as DbUser;
        token.role = dbUser.role;
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
