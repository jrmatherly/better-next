'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { apiLogger } from '@/lib/logger';
import { type UserStats } from '@/types/admin';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Loader2, RefreshCw, UserCircle, UserPlus } from 'lucide-react';
import type { FC } from 'react';
import { toast } from 'sonner';

/**
 * UserStatsPanel displays key user statistics for administrators
 * Shows total users, active users, and new user trends
 */
export const UserStatsPanel: FC = () => {
  // Fetch user statistics using React Query
  const { data: stats, isLoading, isError, refetch, isRefetching } = useQuery<UserStats>({
    queryKey: ['admin', 'user-stats'],
    queryFn: async () => {
      try {
        // Fetch user statistics from API
        const response = await fetch('/api/auth/admin/stats', {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch user stats: ${response.status}`);
        }

        const data = await response.json();
        return data as UserStats;
      } catch (error) {
        apiLogger.error('Error fetching user statistics:', error);
        throw error;
      }
    },
    // Refresh stats every 5 minutes
    refetchInterval: 5 * 60 * 1000,
  });

  /**
   * Handle manual refresh of statistics data
   */
  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success('Statistics refreshed');
    } catch (error) {
      toast.error('Failed to refresh statistics');
      apiLogger.error('Error refreshing statistics:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">User Statistics</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isLoading || isRefetching}
          className="h-8"
        >
          {isRefetching ? (
            <>
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-3.5 w-3.5" />
              Refresh Stats
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <UserCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || isRefetching ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.totalUsers || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.activeUsers
                    ? `${stats.activeUsers} currently active`
                    : 'No active users'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New Users Today</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || isRefetching ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.newUsersToday || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats?.newUsersThisWeek
                    ? `${stats.newUsersThisWeek} this week`
                    : 'No new users this week'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Growth</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading || isRefetching ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold">
                  {stats?.newUsersThisMonth || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  New users in the past 30 days
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>
      
      {isError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-sm text-red-600 dark:text-red-400 flex items-center">
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Error loading statistics. Please try again.
        </div>
      )}
    </div>
  );
};
