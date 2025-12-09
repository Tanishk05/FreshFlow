// src/proxy.ts
import NextAuth from "next-auth";
import { NextResponse } from "next/server";
// Make sure this import path is correct from within the src/ directory
import authConfig from "./auth.config";
import { authorizeUser } from "@/lib/auth-handlers";
import { checkRateLimit, validateNoShellCommands } from "@/lib/security";

// Initialize NextAuth with ONLY the lite config
// THIS IS NOW CORRECT, as auth.config.ts has all the callbacks
const { auth } = NextAuth(authConfig);

// Wrap auth middleware with authorization logic and security features
export const proxy = auth((req) => {
  // Security: Add security headers to all responses
  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(self)"
  );

  // Security: Rate limiting and input validation for API routes
  if (req.nextUrl.pathname.startsWith("/api/")) {
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0] ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // Rate limiting: 100 requests per minute per IP
    if (!checkRateLimit(ip, 100, 60000)) {
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    // Security: Check query parameters for malicious input
    const searchParams = req.nextUrl.searchParams;
    for (const [key, value] of searchParams.entries()) {
      if (!validateNoShellCommands(value)) {
        console.warn(
          `[SECURITY] Suspicious input detected in query param ${key}`
        );
        return NextResponse.json(
          { error: "Invalid input detected" },
          { status: 400 }
        );
      }
    }
  }

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
    // Apply security headers to redirect responses too
    authResult.headers.set("X-Content-Type-Options", "nosniff");
    authResult.headers.set("X-Frame-Options", "DENY");
    authResult.headers.set("X-XSS-Protection", "1; mode=block");
    return authResult;
  }

  // Otherwise, allow the request to proceed with security headers
  return response;
});

// The config object - updated to include API routes for security checks
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
