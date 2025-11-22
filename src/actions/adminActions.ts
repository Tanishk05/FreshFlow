"use server";

import { auth } from "@/auth";
import { getUsersCollection, type User } from "@/models/User";
import { ObjectId } from "mongodb";

// Check if user is admin
export async function isAdmin(): Promise<boolean> {
  const session = await auth();
  if (!session?.user?.email) return false;

  // Add your admin emails here
  const adminEmails = ["tanishkshrivastava6@gmail.com", "admin@freshflow.com"];

  return adminEmails.includes(session.user.email);
}

// Get all users with pagination
export async function getAllUsers(
  page: number = 1,
  limit: number = 20,
  search?: string,
  role?: string
): Promise<{
  users: User[];
  total: number;
  pages: number;
  currentPage: number;
}> {
  const session = await auth();
  if (!session?.user || !(await isAdmin())) {
    throw new Error("Unauthorized: Admin access required");
  }

  const usersCollection = await getUsersCollection();

  // Build query
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const query: any = {};
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
    ];
  }
  if (role && role !== "all") {
    query.role = role;
  }

  const total = await usersCollection.countDocuments(query);
  const pages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  const users = await usersCollection
    .find(query)
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  return {
    users,
    total,
    pages,
    currentPage: page,
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
  const session = await auth();
  if (!session?.user || !(await isAdmin())) {
    throw new Error("Unauthorized: Admin access required");
  }

  const usersCollection = await getUsersCollection();

  const [total, farmers, distributors, retailers, verified] = await Promise.all(
    [
      usersCollection.countDocuments(),
      usersCollection.countDocuments({ role: "farmer" }),
      usersCollection.countDocuments({ role: "distributor" }),
      usersCollection.countDocuments({ role: "retailer" }),
      usersCollection.countDocuments({ emailVerified: { $exists: true } }),
    ]
  );

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
  const session = await auth();
  if (!session?.user || !(await isAdmin())) {
    return { success: false, message: "Unauthorized: Admin access required" };
  }

  try {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { role: newRole } }
    );

    if (result.modifiedCount > 0) {
      return { success: true, message: `User role updated to ${newRole}` };
    } else {
      return { success: false, message: "User not found or role unchanged" };
    }
  } catch (error) {
    console.error("Error updating user role:", error);
    return { success: false, message: "Failed to update user role" };
  }
}

// Delete user
export async function deleteUser(
  userId: string
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user || !(await isAdmin())) {
    return { success: false, message: "Unauthorized: Admin access required" };
  }

  try {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.deleteOne({
      _id: new ObjectId(userId),
    });

    if (result.deletedCount > 0) {
      return { success: true, message: "User deleted successfully" };
    } else {
      return { success: false, message: "User not found" };
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    return { success: false, message: "Failed to delete user" };
  }
}

// Verify user email manually
export async function verifyUserEmail(
  userId: string
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user || !(await isAdmin())) {
    return { success: false, message: "Unauthorized: Admin access required" };
  }

  try {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { emailVerified: new Date() } }
    );

    if (result.modifiedCount > 0) {
      return { success: true, message: "User email verified" };
    } else {
      return { success: false, message: "User not found" };
    }
  } catch (error) {
    console.error("Error verifying email:", error);
    return { success: false, message: "Failed to verify email" };
  }
}

// Get user details
export async function getUserDetails(userId: string): Promise<User | null> {
  const session = await auth();
  if (!session?.user || !(await isAdmin())) {
    throw new Error("Unauthorized: Admin access required");
  }

  const usersCollection = await getUsersCollection();
  return await usersCollection.findOne({ _id: new ObjectId(userId) });
}

// Ban/Unban user
export async function toggleUserBan(
  userId: string,
  banned: boolean
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user || !(await isAdmin())) {
    return { success: false, message: "Unauthorized: Admin access required" };
  }

  try {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { banned, bannedAt: banned ? new Date() : null } }
    );

    if (result.modifiedCount > 0) {
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
    console.error("Error toggling user ban:", error);
    return { success: false, message: "Failed to update user status" };
  }
}

// Toggle admin status
export async function toggleUserAdmin(
  userId: string,
  makeAdmin: boolean
): Promise<{ success: boolean; message: string }> {
  const session = await auth();
  if (!session?.user || !(await isAdmin())) {
    return { success: false, message: "Unauthorized: Admin access required" };
  }

  try {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isAdmin: makeAdmin } }
    );

    if (result.modifiedCount > 0) {
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
    console.error("Error toggling admin status:", error);
    return { success: false, message: "Failed to update admin status" };
  }
}
