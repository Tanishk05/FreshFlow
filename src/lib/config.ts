/**
 * Configuration Service
 * Open/Closed Principle: Centralized configuration that can be extended without modification
 * 
 * This service centralizes all configuration values, making them easy to modify
 * and extend without changing the core application logic.
 */

/**
 * Admin configuration
 */
const ADMIN_EMAILS = [
  "tanishkshrivastava6@gmail.com",
  "admin@freshflow.com",
] as const;

export const AdminConfig = {
  /**
   * Hardcoded admin emails (legacy fallback)
   * In production, this should be moved to environment variables or database
   */
  adminEmails: ADMIN_EMAILS as readonly string[],

  /**
   * Check if an email is in the admin list
   */
  isAdminEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    return (ADMIN_EMAILS as readonly string[]).includes(email);
  },
};

/**
 * Pagination defaults
 */
export const PaginationConfig = {
  defaultPage: 1,
  defaultLimit: 20,
  maxLimit: 100,
} as const;

/**
 * Rate limiting configuration
 */
export const RateLimitConfig = {
  defaultMaxRequests: 10,
  defaultWindowMs: 60000, // 1 minute
  apiMaxRequests: 100,
  apiWindowMs: 60000,
} as const;

/**
 * Database configuration
 */
export const DatabaseConfig = {
  defaultDatabase: process.env.MONGODB_DB || "freshflow",
} as const;

/**
 * Application configuration
 */
export const AppConfig = {
  name: "FreshFlow",
  version: "1.0.0",
  environment: process.env.NODE_ENV || "development",
} as const;

