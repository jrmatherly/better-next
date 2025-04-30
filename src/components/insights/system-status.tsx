'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cloud,
  Database,
  Network,
  Server,
  Shield,
  XCircle,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Sample data for system status
const systemComponents = [
  {
    id: 'web-servers',
    name: 'Web Servers',
    status: 'healthy',
    uptime: '99.99%',
    load: 67,
    icon: <Server className="h-4 w-4" />,
    details: 'All web servers operating normally',
  },
  {
    id: 'database-cluster',
    name: 'Database Cluster',
    status: 'warning',
    uptime: '99.95%',
    load: 82,
    icon: <Database className="h-4 w-4" />,
    details: 'High memory usage on primary node',
  },
  {
    id: 'load-balancers',
    name: 'Load Balancers',
    status: 'healthy',
    uptime: '100%',
    load: 45,
    icon: <Network className="h-4 w-4" />,
    details: 'Traffic distribution optimal',
  },
  {
    id: 'cdn-services',
    name: 'CDN Services',
    status: 'healthy',
    uptime: '99.98%',
    load: 58,
    icon: <Cloud className="h-4 w-4" />,
    details: 'Content delivery performing well',
  },
  {
    id: 'auth-services',
    name: 'Authentication Services',
    status: 'healthy',
    uptime: '99.97%',
    load: 42,
    icon: <Shield className="h-4 w-4" />,
    details: 'Authentication system operating normally',
  },
  {
    id: 'storage-services',
    name: 'Storage Services',
    status: 'critical',
    uptime: '99.5%',
    load: 94,
    icon: <Database className="h-4 w-4" />,
    details: 'High disk usage on primary storage node',
  },
];

// Sample data for the charts
const generateTimeSeriesData = (
  hours: number,
  baseValue: number,
  fluctuation: number
) => {
  const data = [];
  const now = new Date();

  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const value = baseValue + (Math.random() * fluctuation * 2 - fluctuation);
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Math.max(0, Math.min(100, value)),
    });
  }

  return data;
};

const cpuData = generateTimeSeriesData(24, 65, 15);
const memoryData = generateTimeSeriesData(24, 50, 10);
const diskData = generateTimeSeriesData(24, 75, 5);
const networkData = generateTimeSeriesData(24, 40, 20);

// Props interface
interface SystemStatusProps {
  timeRange: string;
}

export function SystemStatus({ timeRange }: SystemStatusProps) {
  // Get status icon based on status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'maintenance':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-muted-foreground" />;
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  // Get load color based on percentage
  const getLoadColor = (load: number) => {
    if (load >= 90) return 'bg-destructive';
    if (load >= 75) return 'bg-orange-500';
    if (load >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Count status types
  const statusCounts = {
    healthy: systemComponents.filter(c => c.status === 'healthy').length,
    warning: systemComponents.filter(c => c.status === 'warning').length,
    critical: systemComponents.filter(c => c.status === 'critical').length,
    maintenance: systemComponents.filter(c => c.status === 'maintenance')
      .length,
    offline: systemComponents.filter(c => c.status === 'offline').length,
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>System Status</CardTitle>
        <CardDescription>
          Overall system health and component status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Summary */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-green-500/10">
            <span className="text-green-500 font-medium text-xl">
              {statusCounts.healthy}
            </span>
            <span className="text-xs text-muted-foreground">Healthy</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-orange-500/10">
            <span className="text-orange-500 font-medium text-xl">
              {statusCounts.warning}
            </span>
            <span className="text-xs text-muted-foreground">Warning</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-destructive/10">
            <span className="text-destructive font-medium text-xl">
              {statusCounts.critical}
            </span>
            <span className="text-xs text-muted-foreground">Critical</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-blue-500/10">
            <span className="text-blue-500 font-medium text-xl">
              {statusCounts.maintenance}
            </span>
            <span className="text-xs text-muted-foreground">Maintenance</span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-muted">
            <span className="text-muted-foreground font-medium text-xl">
              {statusCounts.offline}
            </span>
            <span className="text-xs text-muted-foreground">Offline</span>
          </div>
        </div>

        <Tabs defaultValue="list">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="list">Components</TabsTrigger>
            <TabsTrigger value="chart">Utilization</TabsTrigger>
            <TabsTrigger value="uptime">Uptime</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4 mt-4">
            {systemComponents.map(component => (
              <div
                key={component.id}
                className="flex flex-col space-y-2 p-3 rounded-md border hover:bg-muted/50 transition-colors"
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {component.icon}
                    <span className="font-medium">{component.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      className={`${
                        component.status === 'healthy'
                          ? 'bg-green-500'
                          : component.status === 'warning'
                            ? 'bg-orange-500'
                            : component.status === 'critical'
                              ? 'bg-destructive'
                              : component.status === 'maintenance'
                                ? 'bg-blue-500'
                                : 'bg-muted-foreground'
                      }`}
                    >
                      {getStatusIcon(component.status)}
                      <span className="ml-1 capitalize">
                        {component.status}
                      </span>
                    </Badge>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Load</span>
                    <span>{component.load}%</span>
                  </div>
                  <Progress
                    value={component.load}
                    className="h-1"
                    indicatorClassName={getLoadColor(component.load)}
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">
                    Uptime: {component.uptime}
                  </span>
                  <span className="text-muted-foreground">
                    {component.details}
                  </span>
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="chart" className="mt-4">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={cpuData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{
                      fontSize: 12,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    unit="%"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: number) => [
                      `${value.toFixed(1)}%`,
                      'Utilization',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-1))"
                    strokeWidth={2}
                    dot={{ r: 0 }}
                    activeDot={{ r: 4 }}
                    name="CPU"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="uptime" className="mt-4">
            <div className="rounded-md border">
              <div className="p-4 border-b">
                <h4 className="text-sm font-medium">
                  System Uptime Statistics
                </h4>
              </div>
              <div className="divide-y">
                {systemComponents.map(component => (
                  <div
                    key={component.id}
                    className="flex justify-between items-center p-4"
                  >
                    <div className="flex items-center gap-2">
                      {component.icon}
                      <span className="text-sm">{component.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          component.status === 'healthy'
                            ? 'bg-green-500'
                            : component.status === 'warning'
                              ? 'bg-orange-500'
                              : component.status === 'critical'
                                ? 'bg-destructive'
                                : component.status === 'maintenance'
                                  ? 'bg-blue-500'
                                  : 'bg-muted-foreground'
                        }`}
                      />
                      <span className="text-sm">{component.uptime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
