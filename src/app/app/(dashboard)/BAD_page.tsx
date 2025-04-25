import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { formatTimeAgo, getUserStats } from '@/lib/auth/user-stats';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'View application statistics and activity',
};

/**
 * Main dashboard page showing user statistics and recent activity
 * Authentication is handled by the parent layout (app/layout.tsx)
 */
export default async function DashboardPage() {
  // Get user statistics based on role
  const { userCount, recentActivity, userMetrics } = await getUserStats();

  return (
    <div className="container py-8 space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your application.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{userCount}</div>
            <p className="text-xs text-muted-foreground">
              Registered users in the system
            </p>
          </CardContent>
        </Card>

        {userMetrics.newUsers > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">New Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{userMetrics.newUsers}</div>
              <p className="text-xs text-muted-foreground">
                New registrations in the last 7 days
              </p>
            </CardContent>
          </Card>
        )}

        {userMetrics.activeUsers > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {userMetrics.activeUsers}
              </div>
              <p className="text-xs text-muted-foreground">
                Active in the last 30 days
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity */}
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            The latest user activity in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length > 0 ? (
            <ul className="space-y-2">
              {recentActivity.map(activity => (
                <li
                  key={activity.id}
                  className="flex items-center p-3 text-sm border-b last:border-0"
                >
                  <span className="font-medium">{activity.user}</span>
                  <span className="ml-2 text-muted-foreground">
                    {activity.action}
                  </span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="py-6 text-center text-muted-foreground">
              <p>No recent activity to display</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
