import { NextURL } from "next/dist/server/web/next-url";

/**
 * Authentication handler utilities
 * Centralized logic for handling authentication redirects and authorization
 */

interface AuthContext {
  isLoggedIn: boolean;
  userRole: string | null;
  nextUrl: NextURL;
}

/**
 * Handles authentication for non-logged-in users
 * @returns Response.redirect or true to allow access
 */
export function handleUnauthenticatedUser(
  nextUrl: NextURL
): Response | boolean {
  const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isCompleteSignupPage = nextUrl.pathname.startsWith("/complete-signup");
  const isOnMarketplace = nextUrl.pathname.startsWith("/marketplace");
  const isOnOrderBook = nextUrl.pathname.startsWith("/order-book");
  const isOnProfile = nextUrl.pathname.startsWith("/profile");
  const isOnMyProduce = nextUrl.pathname.startsWith("/my-produce");

  if (
    isOnDashboard ||
    isCompleteSignupPage ||
    isOnMarketplace ||
    isOnOrderBook ||
    isOnProfile ||
    isOnMyProduce
  ) {
    // Not logged in, trying to access protected page: redirect to home
    return Response.redirect(new URL("/", nextUrl));
  }

  // Allow access to homepage or any other public route
  return true;
}

/**
 * Handles authentication for logged-in users without a role
 * @returns Response.redirect or true to allow access
 */
export function handleIncompleteSignup(nextUrl: NextURL): Response | boolean {
  const isCompleteSignupPage = nextUrl.pathname.startsWith("/complete-signup");

  if (!isCompleteSignupPage) {
    // Logged in but has no role? Force them to complete signup.
    return Response.redirect(new URL("/complete-signup", nextUrl));
  }

  return true;
}

/**
 * Handles redirects for users with completed profiles
 * @returns Response.redirect or true to continue
 */
export function handleAuthenticatedUser(
  userRole: string,
  nextUrl: NextURL
): Response | boolean {
  const isCompleteSignupPage = nextUrl.pathname.startsWith("/complete-signup");
  const isOnHomepage = nextUrl.pathname === "/";
  const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
  const isOnMarketplace = nextUrl.pathname.startsWith("/marketplace");
  const isOnOrderBook = nextUrl.pathname.startsWith("/order-book");
  const isOnMyProduce = nextUrl.pathname.startsWith("/my-produce");

  // User completed signup but still on signup page
  if (isCompleteSignupPage) {
    return Response.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
  }

  // User on homepage - redirect to their dashboard
  if (isOnHomepage) {
    return Response.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
  }

  // User on dashboard - verify they're on the correct role's dashboard
  if (isOnDashboard) {
    return handleDashboardAccess(userRole, nextUrl);
  }

  // User on marketplace - verify they have access to this marketplace
  if (isOnMarketplace) {
    return handleMarketplaceAccess(userRole, nextUrl);
  }

  // User on order-book - verify they're a distributor
  if (isOnOrderBook) {
    return handleOrderBookAccess(userRole, nextUrl);
  }

  // User on my-produce - verify they're a farmer
  if (isOnMyProduce) {
    return handleMyProduceAccess(userRole, nextUrl);
  }

  // Allow access to other routes (profile, etc.)
  return true;
}

/**
 * Verifies user is accessing the correct dashboard for their role
 * @returns Response.redirect or true to allow access
 */
export function handleDashboardAccess(
  userRole: string,
  nextUrl: NextURL
): Response | boolean {
  // Check if the dashboard path matches their role
  if (nextUrl.pathname.startsWith(`/dashboard/${userRole}`)) {
    // Path matches role (e.g., farmer on /dashboard/farmer). Allow.
    return true;
  }

  // Path does NOT match role (e.g., farmer on /dashboard/retailer).
  // Redirect them back to their own dashboard.
  return Response.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
}

/**
 * Handles marketplace page access based on user role
 * @returns Response.redirect or true to allow access
 */
export function handleMarketplaceAccess(
  userRole: string,
  nextUrl: NextURL
): Response | boolean {
  // Farmer marketplace: only farmers can access
  if (nextUrl.pathname.startsWith("/marketplace/farmer")) {
    if (userRole === "farmer") {
      return true;
    }
    // Non-farmers trying to access farmer marketplace
    return Response.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
  }

  // Retailer marketplace: only retailers can access
  if (nextUrl.pathname.startsWith("/marketplace/retailer")) {
    if (userRole === "retailer") {
      return true;
    }
    // Non-retailers trying to access retailer marketplace
    return Response.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
  }

  // Unknown marketplace route - redirect to dashboard
  return Response.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
}

/**
 * Handles order-book page access based on user role
 * @returns Response.redirect or true to allow access
 */
export function handleOrderBookAccess(
  userRole: string,
  nextUrl: NextURL
): Response | boolean {
  // Only distributors can access order-book
  if (userRole === "distributor") {
    return true;
  }

  // Non-distributors trying to access order-book
  return Response.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
}

/**
 * Handles my-produce page access based on user role
 * @returns Response.redirect or true to allow access
 */
export function handleMyProduceAccess(
  userRole: string,
  nextUrl: NextURL
): Response | boolean {
  // Only farmers can access my-produce
  if (userRole === "farmer") {
    return true;
  }

  // Non-farmers trying to access my-produce
  return Response.redirect(new URL(`/dashboard/${userRole}`, nextUrl));
}

/**
 * Main authorization handler
 * Orchestrates all authentication logic
 */
export function authorizeUser({
  isLoggedIn,
  userRole,
  nextUrl,
}: AuthContext): Response | boolean {
  // --- 1. User is not logged in ---
  if (!isLoggedIn) {
    return handleUnauthenticatedUser(nextUrl);
  }

  // --- 2. User is logged in but hasn't completed signup ---
  if (!userRole) {
    return handleIncompleteSignup(nextUrl);
  }

  // --- 3. User is logged in with a complete profile ---
  return handleAuthenticatedUser(userRole, nextUrl);
}
