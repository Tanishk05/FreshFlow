// src/proxy.ts
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
// Make sure this import path is correct from within the src/ directory
import authConfig from "./auth.config";
import { authorizeUser } from "@/lib/auth-handlers";

// Initialize NextAuth with ONLY the lite config
// THIS IS NOW CORRECT, as auth.config.ts has all the callbacks
const { auth } = NextAuth(authConfig);

// Wrap auth middleware with authorization logic
export const proxy = auth((req) => {
  // req.auth contains the session
  const session = req.auth;

  const isLoggedIn = !!session?.user;
  const userRole = session?.user?.role as string | null;

  // Use centralized auth handlers
  const authResult = authorizeUser({
    isLoggedIn,
    userRole,
    nextUrl: req.nextUrl,
  });

  // If authResult is a Response, return it (redirect)
  if (authResult instanceof Response) {
    return authResult;
  }

  // Otherwise, allow the request to proceed
  return NextResponse.next();
});

// The config object remains the same
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
