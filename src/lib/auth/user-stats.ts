import { getServerSession } from '@/lib/auth/guards';
import { authLogger } from '@/lib/logger';
import { db } from '@/db';
import { user } from '@/db/schema';
import { ROLES } from '@/types/roles';
import type { UserStats } from '@/types/stats';
import { count, desc, gte } from 'drizzle-orm';

/**
 * Get user statistics for the dashboard based on user's role
 * Different roles will see different levels of detail
 * No parameters needed as it gets the session internally
 */
export async function getUserStats(): Promise<UserStats> {
  try {
    // Get the current session
    const session = await getServerSession();
    const userId = session?.user?.id;
    const userRole = session?.user?.role || 'user';

    // Default stats that all authenticated users can see
    const baseStats: UserStats = {
      userCount: 0,
      recentActivity: [],
      userMetrics: {
        newUsers: 0,
        activeUsers: 0,
      },
    };

    // Get total user count - available to all authenticated users
    const userCountResult = await db.select({ value: count() }).from(user);
    baseStats.userCount = userCountResult[0]?.value ?? 0;

    // For admin or security roles, include more detailed statistics
    if (userRole === ROLES.ADMIN || userRole === ROLES.SECURITY) {
      // Get new users in the last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const newUsersResult = await db
        .select({ value: count() })
        .from(user)
        .where(gte(user.createdAt, oneWeekAgo));
      
      baseStats.userMetrics.newUsers = newUsersResult[0]?.value ?? 0;

      // Get active users in the last 30 days (simplified since we don't track login timestamps)
      // In a real app, we would check against lastLogin field
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeUsersResult = await db
        .select({ value: count() })
        .from(user)
        .where(gte(user.updatedAt, thirtyDaysAgo));
      
      baseStats.userMetrics.activeUsers = activeUsersResult[0]?.value ?? 0;

      // For admins, get recent user registrations as activity
      const recentUsers = await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
        })
        .from(user)
        .orderBy(desc(user.createdAt))
        .limit(5);

      baseStats.recentActivity = recentUsers.map(userData => ({
        id: userData.id,
        user: userData.name || userData.email,
        action: 'registered',
        timestamp: userData.createdAt,
      }));
    }

    return baseStats;
  } catch (error) {
    authLogger.error('Error fetching user stats:', error);
    // Return empty stats on error
    return {
      userCount: 0,
      recentActivity: [],
      userMetrics: {
        newUsers: 0,
        activeUsers: 0,
      },
    };
  }
}

/**
 * Format a date as a relative time (e.g., "2 hours ago")
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} second${diffInSeconds !== 1 ? 's' : ''} ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  }

  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears} year${diffInYears !== 1 ? 's' : ''} ago`;
}
