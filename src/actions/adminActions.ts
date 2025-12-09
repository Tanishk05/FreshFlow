"use server";

import type { UserSerialized } from "@/models/User";
import type { UserRole } from "@/models/User";
import { userRepository } from "@/repositories/user.repository";
import { serializeUsers, serializeUser } from "@/lib/serialization";
import { requireAdmin, isAdmin as checkIsAdmin } from "@/services/auth.service";
import { PaginationConfig } from "@/lib/config";

// Re-export isAdmin for backward compatibility (must be async in "use server" files)
export async function isAdmin(): Promise<boolean> {
  return checkIsAdmin();
}

// Get all users with pagination
export async function getAllUsers(
  page: number = PaginationConfig.defaultPage,
  limit: number = PaginationConfig.defaultLimit,
  search?: string,
  role?: string
): Promise<{
  users: UserSerialized[];
  total: number;
  pages: number;
  currentPage: number;
}> {
  // Check admin access
  await requireAdmin();

  // Use repository to fetch users
  const result = await userRepository.findMany(
    { search, role: role as UserRole | "all" },
    { page, limit }
  );

  // Serialize users for client components
  return {
    users: serializeUsers(result.data),
    total: result.total,
    pages: result.pages,
    currentPage: result.currentPage,
  };
}

// Get user statistics
export async function getUserStats(): Promise<{
  total: number;
  farmers: number;
  distributors: number;
  retailers: number;
  verified: number;
  withOrders: number;
}> {
  // Check admin access
  await requireAdmin();

  // Use repository to fetch statistics
  const [total, farmers, distributors, retailers, verified] = await Promise.all([
    userRepository.countAll(),
    userRepository.countByRole("farmer"),
    userRepository.countByRole("distributor"),
    userRepository.countByRole("retailer"),
    userRepository.countVerified(),
  ]);

  return {
    total,
    farmers,
    distributors,
    retailers,
    verified,
    withOrders: 0, // Can be calculated from orders collection
  };
}

// Update user role
export async function updateUserRole(
  userId: string,
  newRole: "farmer" | "distributor" | "retailer"
): Promise<{ success: boolean; message: string }> {
  try {
    // Check admin access
    await requireAdmin();

    // Use repository to update role
    const result = await userRepository.updateRole(userId, newRole);

    if (result.success) {
      return { success: true, message: `User role updated to ${newRole}` };
    } else {
      return { success: false, message: "User not found or role unchanged" };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, message: error.message };
    }
    console.error("Error updating user role:", error);
    return { success: false, message: "Failed to update user role" };
  }
}

// Delete user
export async function deleteUser(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Check admin access
    await requireAdmin();

    // Use repository to delete user
    const result = await userRepository.delete(userId);

    if (result.success) {
      return { success: true, message: "User deleted successfully" };
    } else {
      return { success: false, message: "User not found" };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, message: error.message };
    }
    console.error("Error deleting user:", error);
    return { success: false, message: "Failed to delete user" };
  }
}

// Verify user email manually
export async function verifyUserEmail(
  userId: string
): Promise<{ success: boolean; message: string }> {
  try {
    // Check admin access
    await requireAdmin();

    // Use repository to verify email
    const result = await userRepository.verifyEmail(userId);

    if (result.success) {
      return { success: true, message: "User email verified" };
    } else {
      return { success: false, message: "User not found" };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, message: error.message };
    }
    console.error("Error verifying email:", error);
    return { success: false, message: "Failed to verify email" };
  }
}

// Get user details
export async function getUserDetails(userId: string): Promise<UserSerialized | null> {
  // Check admin access
  await requireAdmin();

  // Use repository to fetch user
  const user = await userRepository.findById(userId);

  if (!user) {
    return null;
  }

  // Serialize user for client components
  return serializeUser(user);
}

// Ban/Unban user
export async function toggleUserBan(
  userId: string,
  banned: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    // Check admin access
    await requireAdmin();

    // Use repository to toggle ban
    const result = await userRepository.toggleBan(userId, banned);

    if (result.success) {
      return {
        success: true,
        message: banned
          ? "User banned successfully"
          : "User unbanned successfully",
      };
    } else {
      return { success: false, message: "User not found" };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, message: error.message };
    }
    console.error("Error toggling user ban:", error);
    return { success: false, message: "Failed to update user status" };
  }
}

// Toggle admin status
export async function toggleUserAdmin(
  userId: string,
  makeAdmin: boolean
): Promise<{ success: boolean; message: string }> {
  try {
    // Check admin access
    await requireAdmin();

    // Use repository to toggle admin
    const result = await userRepository.toggleAdmin(userId, makeAdmin);

    if (result.success) {
      return {
        success: true,
        message: makeAdmin
          ? "User granted admin privileges"
          : "Admin privileges revoked",
      };
    } else {
      return { success: false, message: "User not found" };
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return { success: false, message: error.message };
    }
    console.error("Error toggling admin status:", error);
    return { success: false, message: "Failed to update admin status" };
  }
}
