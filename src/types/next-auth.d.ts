// types/next-auth.d.ts

import NextAuth, { DefaultSession } from "next-auth";

// Extend the built-in JWT type
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role?: string | null;
    provider?: string;
  }
}

// Extend the built-in Session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role?: string | null;
      provider?: string;
    } & DefaultSession["user"]; // Keep the default fields
  }

  // Extend the built-in User type
  interface User {
    role?: string | null;
  }
}
