'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { RequestStatus, ServiceRequest } from '@/types/services';
import {
  AlertTriangle,
  BarChart,
  CheckCircle,
  Clock,
  FileText,
  PieChart as PieChartIcon,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface RequestStatsProps {
  requests: ServiceRequest[];
}

export function RequestStats({ requests }: RequestStatsProps) {
  // Calculate request statistics
  const stats = useMemo(() => {
    // Status counts
    const statusCounts: Record<RequestStatus, number> = {
      draft: requests.filter(r => r.status === 'draft').length,
      submitted: requests.filter(r => r.status === 'submitted').length,
      pending_approval: requests.filter(r => r.status === 'pending_approval')
        .length,
      approved: requests.filter(r => r.status === 'approved').length,
      in_progress: requests.filter(r => r.status === 'in_progress').length,
      completed: requests.filter(r => r.status === 'completed').length,
      rejected: requests.filter(r => r.status === 'rejected').length,
      cancelled: requests.filter(r => r.status === 'cancelled').length,
    };

    // Priority counts
    const priorityCounts = {
      critical: requests.filter(r => r.priority === 'critical').length,
      high: requests.filter(r => r.priority === 'high').length,
      medium: requests.filter(r => r.priority === 'medium').length,
      low: requests.filter(r => r.priority === 'low').length,
    };

    // Request type counts
    const typeCounts = requests.reduce(
      (acc, request) => {
        acc[request.requestType] = (acc[request.requestType] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Active requests
    const activeRequests = requests.filter(
      r =>
        r.status !== 'completed' &&
        r.status !== 'cancelled' &&
        r.status !== 'rejected'
    ).length;

    // Completed requests in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyCompletedRequests = requests.filter(
      r =>
        r.status === 'completed' &&
        r.completedAt &&
        r.completedAt >= thirtyDaysAgo
    ).length;

    // Requests needing attention (pending approval or rejected)
    const attentionRequests = requests.filter(
      r => r.status === 'pending_approval' || r.status === 'rejected'
    ).length;

    return {
      totalRequests: requests.length,
      activeRequests,
      recentlyCompletedRequests,
      attentionRequests,
      statusCounts,
      priorityCounts,
      typeCounts,
    };
  }, [requests]);

  // Prepare data for status pie chart
  const statusData = [
    {
      name: 'Completed',
      value: stats.statusCounts.completed,
      color: 'hsl(142, 76%, 40%)',
    },
    {
      name: 'In Progress',
      value: stats.statusCounts.in_progress,
      color: 'hsl(217, 91%, 60%)',
    },
    {
      name: 'Approved',
      value: stats.statusCounts.approved,
      color: 'hsl(199, 89%, 48%)',
    },
    {
      name: 'Pending Approval',
      value: stats.statusCounts.pending_approval,
      color: 'hsl(46, 97%, 50%)',
    },
    {
      name: 'Submitted',
      value: stats.statusCounts.submitted,
      color: 'hsl(213, 94%, 68%)',
    },
    {
      name: 'Draft',
      value: stats.statusCounts.draft,
      color: 'hsl(215, 16%, 70%)',
    },
    {
      name: 'Rejected',
      value: stats.statusCounts.rejected,
      color: 'hsl(0, 84%, 60%)',
    },
    {
      name: 'Cancelled',
      value: stats.statusCounts.cancelled,
      color: 'hsl(0, 0%, 60%)',
    },
  ].filter(item => item.value > 0);

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const statuses: RequestStatus[] = [
    'draft',
    'submitted',
    'pending_approval',
    'approved',
    'in_progress',
    'completed',
    'rejected',
    'cancelled',
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <BarChart className="mr-2 h-4 w-4" />
            Request Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted/50">
              <span className="text-2xl font-bold">{stats.totalRequests}</span>
              <span className="text-xs text-muted-foreground">
                Total Requests
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted/50">
              <span className="text-2xl font-bold">{stats.activeRequests}</span>
              <span className="text-xs text-muted-foreground">
                Active Requests
              </span>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {statuses.map(status => (
              <div
                key={status}
                className="flex justify-between items-center text-sm"
              >
                <div className="flex items-center">
                  {status === 'completed' && (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-1.5" />
                  )}
                  {status === 'in_progress' && (
                    <Clock className="h-4 w-4 text-blue-500 mr-1.5" />
                  )}
                  {status === 'pending_approval' && (
                    <Clock className="h-4 w-4 text-amber-500 mr-1.5" />
                  )}
                  {status === 'rejected' && (
                    <AlertTriangle className="h-4 w-4 text-destructive mr-1.5" />
                  )}
                  <span>{formatStatus(status)}</span>
                </div>
                <span>{stats.statusCounts[status]}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <PieChartIcon className="mr-2 h-4 w-4" />
            Request Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusData.length > 0 ? (
            <div className="h-[200px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={60}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value} Requests`, '']}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No request data available
              </p>
            </div>
          )}

          {statusData.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              {statusData.map((entry, index) => (
                <div
                  key={entry.name}
                  className="flex items-center gap-2 text-xs"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
