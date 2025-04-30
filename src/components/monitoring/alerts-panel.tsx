'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logger } from '@/lib/logger';
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle,
  Clock,
  Filter,
  Info,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

// Sample data for alerts
const alerts = [
  {
    id: 'a1',
    severity: 'critical',
    title: 'High CPU usage on production database server',
    message:
      'Database server DB-01 CPU usage exceeding 90% for more than 15 minutes',
    timestamp: new Date(Date.now() - 25 * 60 * 1000), // 25 minutes ago
    source: 'Database Monitoring',
    status: 'active',
    acknowledged: false,
  },
  {
    id: 'a2',
    severity: 'warning',
    title: 'Memory usage approaching threshold',
    message: 'Web server WS-03 memory usage at 85% and trending upward',
    timestamp: new Date(Date.now() - 47 * 60 * 1000), // 47 minutes ago
    source: 'Infrastructure Monitoring',
    status: 'active',
    acknowledged: true,
  },
  {
    id: 'a3',
    severity: 'info',
    title: 'Scheduled maintenance starting soon',
    message:
      'Scheduled maintenance for file storage system will begin in 30 minutes',
    timestamp: new Date(Date.now() - 112 * 60 * 1000), // 112 minutes ago
    source: 'System Administration',
    status: 'active',
    acknowledged: false,
  },
  {
    id: 'a4',
    severity: 'warning',
    title: 'High network latency detected',
    message: 'Network latency between data centers exceeding 200ms',
    timestamp: new Date(Date.now() - 165 * 60 * 1000), // 165 minutes ago
    source: 'Network Monitoring',
    status: 'active',
    acknowledged: false,
  },
  {
    id: 'a5',
    severity: 'critical',
    title: 'Storage service reaching capacity',
    message: 'Primary storage system at 95% capacity',
    timestamp: new Date(Date.now() - 180 * 60 * 1000), // 3 hours ago
    source: 'Storage Monitoring',
    status: 'active',
    acknowledged: true,
  },
  {
    id: 'a6',
    severity: 'info',
    title: 'Authentication service restarted',
    message: 'Auth service restarted successfully after configuration update',
    timestamp: new Date(Date.now() - 240 * 60 * 1000), // 4 hours ago
    source: 'Authentication System',
    status: 'resolved',
    acknowledged: true,
  },
  {
    id: 'a7',
    severity: 'warning',
    title: 'API rate limit approaching',
    message: 'External API rate limit at 80% of maximum',
    timestamp: new Date(Date.now() - 300 * 60 * 1000), // 5 hours ago
    source: 'API Gateway',
    status: 'resolved',
    acknowledged: true,
  },
  {
    id: 'a8',
    severity: 'critical',
    title: 'Database connection pool exhausted',
    message: 'Application database connection pool reached maximum size',
    timestamp: new Date(Date.now() - 480 * 60 * 1000), // 8 hours ago
    source: 'Database Monitoring',
    status: 'resolved',
    acknowledged: true,
  },
];

// Function to format time
const formatTime = (date: Date) => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffMins < 1440) {
    // less than a day
    const hours = Math.floor(diffMins / 60);
    return `${hours}h ago`;
  }
  const days = Math.floor(diffMins / 1440);
  return `${days}d ago`;
};

// Interface for props
interface AlertsPanelProps {
  limit?: number;
}

export function AlertsPanel({ limit }: AlertsPanelProps) {
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectedAlertId, setSelectedAlertId] = useState<string | null>(null);

  // Filter alerts based on current filters
  const filteredAlerts = alerts.filter(alert => {
    if (severityFilter && alert.severity !== severityFilter) return false;
    if (statusFilter && alert.status !== statusFilter) return false;
    return true;
  });

  // Limit the number of alerts displayed if a limit is provided
  const displayedAlerts = limit
    ? filteredAlerts.slice(0, limit)
    : filteredAlerts;

  // Get counts for each severity
  const criticalCount = filteredAlerts.filter(
    a => a.severity === 'critical' && a.status === 'active'
  ).length;
  const warningCount = filteredAlerts.filter(
    a => a.severity === 'warning' && a.status === 'active'
  ).length;
  const infoCount = filteredAlerts.filter(
    a => a.severity === 'info' && a.status === 'active'
  ).length;

  // Get alert icon based on severity
  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  // Get alert badge based on severity
  const getAlertBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500">Warning</Badge>;
      case 'info':
        return <Badge className="bg-blue-500">Info</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  // Get status badge based on status
  const getStatusBadge = (status: string, acknowledged: boolean) => {
    if (status === 'resolved') {
      return <Badge className="bg-green-500">Resolved</Badge>;
    }
    if (acknowledged) {
      return (
        <Badge
          variant="outline"
          className="border-blue-500 text-blue-500"
        >
          Acknowledged
        </Badge>
      );
    }
    return (
      <Badge
        variant="outline"
        className="border-destructive text-destructive"
      >
        Unacknowledged
      </Badge>
    );
  };

  // Handle acknowledging an alert
  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would call an API to update the alert status
    logger.info(`Alert ${id} acknowledged`);
  };

  // Handle resolving an alert
  const handleResolve = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // In a real app, this would call an API to update the alert status
    logger.info(`Alert ${id} resolved`);
  };

  // Handle alert selection
  const handleAlertSelect = (id: string) => {
    setSelectedAlertId(id === selectedAlertId ? null : id);
  };

  // Reset filters
  const resetFilters = () => {
    setSeverityFilter(null);
    setStatusFilter(null);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            System Alerts
          </CardTitle>
          <CardDescription>Monitoring alerts and notifications</CardDescription>
        </div>

        {!limit && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {(severityFilter || statusFilter) && (
                  <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                    {(severityFilter ? 1 : 0) + (statusFilter ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter Alerts</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Severity
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  onClick={() => setSeverityFilter('critical')}
                  className={severityFilter === 'critical' ? 'bg-muted' : ''}
                >
                  <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                  Critical
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  onClick={() => setSeverityFilter('warning')}
                  className={severityFilter === 'warning' ? 'bg-muted' : ''}
                >
                  <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                  Warning
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  onClick={() => setSeverityFilter('info')}
                  className={severityFilter === 'info' ? 'bg-muted' : ''}
                >
                  <Info className="mr-2 h-4 w-4 text-blue-500" />
                  Information
                </button>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Status
              </DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  onClick={() => setStatusFilter('active')}
                  className={statusFilter === 'active' ? 'bg-muted' : ''}
                >
                  <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                  Active
                </button>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <button
                  type="button"
                  onClick={() => setStatusFilter('resolved')}
                  className={statusFilter === 'resolved' ? 'bg-muted' : ''}
                >
                  <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                  Resolved
                </button>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!severityFilter && !statusFilter}
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  Reset Filters
                </button>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>

      <CardContent>
        {limit ? (
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-2">
              <Badge variant="destructive" className="rounded-sm">
                {criticalCount}
              </Badge>
              <Badge className="bg-orange-500 rounded-sm">{warningCount}</Badge>
              <Badge className="bg-blue-500 rounded-sm">{infoCount}</Badge>
            </div>
            <button
              type="button"
              className="p-0 h-auto text-xs text-primary"
            >
              View All Alerts
            </button>
          </div>
        ) : (
          <Tabs defaultValue="active">
            <TabsList className="w-full grid grid-cols-3 mb-4">
              <TabsTrigger value="active">
                Active
              </TabsTrigger>
              <TabsTrigger value="all">
                All Alerts
              </TabsTrigger>
              <TabsTrigger value="history">
                History
              </TabsTrigger>
            </TabsList>
          </Tabs>
        )}

        <ScrollArea className={limit ? 'h-[220px]' : 'h-[500px]'}>
          <div className="space-y-4">
            {displayedAlerts.length > 0 ? (
              displayedAlerts.map(alert => (
                <button
                  key={alert.id}
                  type="button"
                  className={`rounded-md border p-3 transition-colors cursor-pointer ${selectedAlertId === alert.id ? 'bg-muted' : 'hover:bg-muted/50'}`}
                  onClick={() => handleAlertSelect(alert.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="pt-0.5">
                        {getAlertIcon(alert.severity)}
                      </div>
                      <div className="space-y-1">
                        <p className="font-medium text-sm">{alert.title}</p>
                        {selectedAlertId === alert.id && (
                          <p className="text-sm text-muted-foreground">
                            {alert.message}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{alert.source}</span>
                          <span>•</span>
                          <span>{formatTime(alert.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex gap-2">
                        {getAlertBadge(alert.severity)}
                      </div>
                      {selectedAlertId === alert.id && (
                        <div className="flex gap-2 mt-2">
                          {alert.status !== 'resolved' &&
                            !alert.acknowledged && (
                              <button
                                type="button"
                                className="h-7 text-xs"
                                onClick={e => handleAcknowledge(alert.id, e)}
                              >
                                Acknowledge
                              </button>
                            )}
                          {alert.status !== 'resolved' && (
                            <button
                              type="button"
                              className="h-7 text-xs"
                              onClick={e => handleResolve(alert.id, e)}
                            >
                              Resolve
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedAlertId === alert.id && (
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <span className="text-xs text-muted-foreground">
                        Status:
                      </span>
                      {getStatusBadge(alert.status, alert.acknowledged)}
                    </div>
                  )}
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-8">
                <CheckCircle className="h-10 w-10 text-muted-foreground mb-3" />
                <h3 className="text-lg font-medium">No alerts found</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-xs">
                  {severityFilter || statusFilter
                    ? 'There are no alerts matching your current filters'
                    : 'All systems are operating normally'}
                </p>
                {(severityFilter || statusFilter) && (
                  <button
                    type="button"
                    className="mt-4"
                    onClick={resetFilters}
                  >
                    Reset Filters
                  </button>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
