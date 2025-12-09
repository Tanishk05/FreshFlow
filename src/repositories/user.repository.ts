/**
 * User Repository
 * Single Responsibility: Handle all database operations for users
 * Dependency Inversion: Provides abstraction over database access
 * 
 * This repository encapsulates all user-related database queries,
 * making the code more maintainable and testable.
 */

import { getUsersCollection, type User } from "@/models/User";
import { ObjectId } from "mongodb";
import type { UserRole } from "@/models/User";

export interface UserQuery {
  search?: string;
  role?: UserRole | "all";
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  pages: number;
  currentPage: number;
}

/**
 * User Repository class
 */
export class UserRepository {
  /**
   * Build query from filters
   */
  private buildQuery(query: UserQuery): any {
    const mongoQuery: any = {};
    
    if (query.search) {
      mongoQuery.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
        { username: { $regex: query.search, $options: "i" } },
      ];
    }
    
    if (query.role && query.role !== "all") {
      mongoQuery.role = query.role;
    }
    
    return mongoQuery;
  }

  /**
   * Find users with pagination
   */
  async findMany(
    query: UserQuery,
    pagination: PaginationOptions
  ): Promise<PaginatedResult<User>> {
    const usersCollection = await getUsersCollection();
    const mongoQuery = this.buildQuery(query);
    
    const total = await usersCollection.countDocuments(mongoQuery);
    const pages = Math.ceil(total / pagination.limit);
    const skip = (pagination.page - 1) * pagination.limit;

    const users = await usersCollection
      .find(mongoQuery)
      .sort({ _id: -1 })
      .skip(skip)
      .limit(pagination.limit)
      .toArray();

    return {
      data: users,
      total,
      pages,
      currentPage: pagination.page,
    };
  }

  /**
   * Find user by ID
   */
  async findById(userId: string): Promise<User | null> {
    const usersCollection = await getUsersCollection();
    return usersCollection.findOne({ _id: new ObjectId(userId) });
  }

  /**
   * Count users by role
   */
  async countByRole(role: UserRole): Promise<number> {
    const usersCollection = await getUsersCollection();
    return usersCollection.countDocuments({ role });
  }

  /**
   * Count all users
   */
  async countAll(): Promise<number> {
    const usersCollection = await getUsersCollection();
    return usersCollection.countDocuments();
  }

  /**
   * Count verified users
   */
  async countVerified(): Promise<number> {
    const usersCollection = await getUsersCollection();
    return usersCollection.countDocuments({ emailVerified: { $exists: true } });
  }

  /**
   * Update user with partial data
   */
  async update(
    userId: string,
    updates: Partial<User>
  ): Promise<{ success: boolean; modifiedCount: number }> {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updates }
    );
    
    return {
      success: result.modifiedCount > 0,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Update user role
   */
  async updateRole(
    userId: string,
    role: UserRole
  ): Promise<{ success: boolean; modifiedCount: number }> {
    return this.update(userId, { role });
  }

  /**
   * Update user email verification
   */
  async verifyEmail(userId: string): Promise<{ success: boolean; modifiedCount: number }> {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { emailVerified: new Date() } }
    );
    
    return {
      success: result.modifiedCount > 0,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Toggle user ban status
   */
  async toggleBan(
    userId: string,
    banned: boolean
  ): Promise<{ success: boolean; modifiedCount: number }> {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { banned, bannedAt: banned ? new Date() : null } }
    );
    
    return {
      success: result.modifiedCount > 0,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Toggle admin status
   */
  async toggleAdmin(
    userId: string,
    isAdmin: boolean
  ): Promise<{ success: boolean; modifiedCount: number }> {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: { isAdmin } }
    );
    
    return {
      success: result.modifiedCount > 0,
      modifiedCount: result.modifiedCount,
    };
  }

  /**
   * Delete user
   */
  async delete(userId: string): Promise<{ success: boolean; deletedCount: number }> {
    const usersCollection = await getUsersCollection();
    const result = await usersCollection.deleteOne({
      _id: new ObjectId(userId),
    });
    
    return {
      success: result.deletedCount > 0,
      deletedCount: result.deletedCount,
    };
  }
}

// Export singleton instance
export const userRepository = new UserRepository();

