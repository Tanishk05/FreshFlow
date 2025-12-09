/**
 * Base Repository Interface
 * Provides common repository patterns and utilities
 */

import { ObjectId } from "mongodb";
import { PaginationConfig } from "@/lib/config";

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
 * Build pagination options with defaults
 */
export function buildPaginationOptions(
  page?: number,
  limit?: number
): PaginationOptions {
  return {
    page: page || PaginationConfig.defaultPage,
    limit: limit || PaginationConfig.defaultLimit,
  };
}

/**
 * Convert string ID to ObjectId
 */
export function convertToObjectId(id: string | ObjectId): ObjectId {
  if (id instanceof ObjectId) return id;
  return new ObjectId(id);
}

/**
 * Convert ObjectId to string
 */
export function toStringId(id: ObjectId | string | undefined): string | null {
  if (!id) return null;
  if (typeof id === "string") return id;
  return id.toString();
}

