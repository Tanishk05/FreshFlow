// src/proxy.ts
import NextAuth from "next-auth";
// Make sure this import path is correct from within the src/ directory
import authConfig from "./auth.config";

// Initialize NextAuth with ONLY the lite config
const { auth } = NextAuth(authConfig);

// THIS IS THE FIX:
// The exported function must be named 'proxy'
export const proxy = auth;

// The config object remains the same
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
