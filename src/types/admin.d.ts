import type { User } from './auth';

/**
 * Filter options for user queries in the admin panel
 */
export interface UserFilterOptions {
  /**
   * Filter by user role
   */
  role?: string;

  /**
   * Search string to match against user properties
   */
  search?: string;

  /**
   * Maximum number of results to return
   */
  limit?: number;

  /**
   * Page number for pagination
   */
  page?: number;
}

/**
 * Statistics about user activity and growth
 */
export interface UserStats {
  /**
   * Total number of users in the system
   */
  totalUsers: number;

  /**
   * Number of active users (logged in within last 30 days)
   */
  activeUsers: number;

  /**
   * Number of new users registered today
   */
  newUsersToday: number;

  /**
   * Number of new users registered this week
   */
  newUsersThisWeek: number;

  /**
   * Number of new users registered this month
   */
  newUsersThisMonth: number;
}

/**
 * BetterAuth response type definitions for user listing
 */
export interface BetterAuthListUsersResponse {
  users: User[];
  total: number;
  limit?: number;
  offset?: number;
}

/**
 * Admin client interface to improve type safety
 */
export interface BetterAuthAdminClient {
  listUsers: (options: { query: Record<string, unknown> }) => Promise<unknown>;
  getUser: (options: { userId: string }) => Promise<unknown>;
  updateUser: (options: {
    userId: string;
    data: Partial<User>;
  }) => Promise<unknown>;
  removeUser: (options: { userId: string }) => Promise<unknown>;
}
