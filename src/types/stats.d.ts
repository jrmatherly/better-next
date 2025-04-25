/**
 * User statistics and metrics for the dashboard
 */
export interface UserStats {
  /**
   * Total number of users in the system
   */
  userCount: number;

  /**
   * Recent user activity entries
   */
  recentActivity: Array<{
    id: string;
    user: string;
    action: string;
    timestamp: Date;
  }>;

  /**
   * User-specific metrics based on role
   */
  userMetrics: {
    /**
     * New users in the last 7 days
     */
    newUsers: number;

    /**
     * Active users in the last 30 days
     */
    activeUsers: number;
  };
}
