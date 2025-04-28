import { getServerSession } from '@/lib/auth/guards';
import { apiLogger } from '@/lib/logger';
import { type UserStats } from '@/types/admin';
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { and, count, eq, gte } from 'drizzle-orm';
import { user, session as sessionTable } from '@/db/schema';

/**
 * GET handler for admin stats endpoint
 * Returns user statistics for the admin dashboard
 * Requires admin role
 */
export async function GET() {
  try {
    // Get the authenticated session
    const userSession = await getServerSession();

    // Check if user is authenticated and has admin role
    if (!userSession?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!userSession.user.role?.includes('admin')) {
      return NextResponse.json(
        { error: 'Forbidden - requires admin role' },
        { status: 403 }
      );
    }

    // Get today's date at midnight
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get date for 7 days ago
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Get date for 30 days ago
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    // Get total user count
    const totalUsersResult = await db
      .select({ count: count() })
      .from(user);
    
    const totalUsers = totalUsersResult[0]?.count || 0;

    // Get active users (has session in last 30 days)
    const activeUsersResult = await db
      .select({ userId: user.id })
      .from(user)
      .leftJoin(
        sessionTable, 
        eq(user.id, sessionTable.userId)
      )
      .where(
        and(
          gte(sessionTable.updatedAt, monthAgo)
        )
      )
      .groupBy(user.id);
    
    const activeUsers = activeUsersResult.length || 0;

    // Get new users today
    const newUsersTodayResult = await db
      .select({ count: count() })
      .from(user)
      .where(
        gte(user.createdAt, today)
      );
    
    const newUsersToday = newUsersTodayResult[0]?.count || 0;

    // Get new users this week
    const newUsersWeekResult = await db
      .select({ count: count() })
      .from(user)
      .where(
        gte(user.createdAt, weekAgo)
      );
    
    const newUsersThisWeek = newUsersWeekResult[0]?.count || 0;

    // Get new users this month
    const newUsersMonthResult = await db
      .select({ count: count() })
      .from(user)
      .where(
        gte(user.createdAt, monthAgo)
      );
    
    const newUsersThisMonth = newUsersMonthResult[0]?.count || 0;

    // Compose the stats object
    const stats: UserStats = {
      totalUsers,
      activeUsers,
      newUsersToday,
      newUsersThisWeek,
      newUsersThisMonth,
    };

    // Return the stats
    return NextResponse.json(stats);
  } catch (error) {
    apiLogger.error('Error fetching admin stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
