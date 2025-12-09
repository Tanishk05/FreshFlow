/**
 * Authentication & Authorization Service
 * Single Responsibility: Handle all authentication and authorization logic
 * Dependency Inversion: Depends on abstractions (auth, repositories) not concrete implementations
 *
 * This service centralizes all auth-related logic, making it reusable and testable.
 */

import { auth } from "@/auth";
import { getUsersCollection, type User } from "@/models/User";
import { ObjectId } from "mongodb";
import { AdminConfig } from "@/lib/config";

export interface AuthResult {
  isAuthenticated: boolean;
  userId?: string;
  userEmail?: string | null;
  isAdmin?: boolean;
}

/**
 * Get current session and user info
 */
export async function getCurrentSession(): Promise<AuthResult> {
  const session = await auth();

  if (!session?.user?.id) {
    return { isAuthenticated: false };
  }

  return {
    isAuthenticated: true,
    userId: session.user.id,
    userEmail: session.user.email || null,
    isAdmin: session.user.isAdmin || false,
  };
}

/**
 * Check if current user is authenticated
 */
export async function requireAuth(): Promise<{
  userId: string;
  userEmail: string | null;
}> {
  const session = await getCurrentSession();

  if (!session.isAuthenticated || !session.userId) {
    throw new Error("Unauthorized: Authentication required");
  }

  return {
    userId: session.userId,
    userEmail: session.userEmail || null,
  };
}

/**
 * Check if current user is admin
 * Implements multiple fallback strategies:
 * 1. Check session.isAdmin flag
 * 2. Check database directly
 * 3. Check hardcoded admin emails (legacy)
 */
export async function requireAdmin(): Promise<{
  userId: string;
  userEmail: string | null;
}> {
  const session = await getCurrentSession();

  if (!session.isAuthenticated || !session.userId) {
    throw new Error("Unauthorized: Authentication required");
  }

  // First, check if isAdmin is set in the session (from token)
  if (session.isAdmin === true) {
    return {
      userId: session.userId,
      userEmail: session.userEmail || null,
    };
  }

  // Fallback: Check the database directly to ensure we have the latest value
  // This handles cases where isAdmin was changed but session hasn't refreshed
  try {
    const usersCollection = await getUsersCollection();
    const user = await usersCollection.findOne({
      _id: new ObjectId(session.userId),
    });

    if (user?.isAdmin === true) {
      return {
        userId: session.userId,
        userEmail: session.userEmail || null,
      };
    }
  } catch (error) {
    console.error("Error checking admin status:", error);
  }

  // Legacy: Also check against hardcoded admin emails as fallback
  // This ensures existing admins still work
  if (session.userEmail && AdminConfig.isAdminEmail(session.userEmail)) {
    return {
      userId: session.userId,
      userEmail: session.userEmail,
    };
  }

  throw new Error("Unauthorized: Admin access required");
}

/**
 * Check if user is admin (non-throwing version)
 */
export async function isAdmin(): Promise<boolean> {
  try {
    await requireAdmin();
    return true;
  } catch {
    return false;
  }
}
