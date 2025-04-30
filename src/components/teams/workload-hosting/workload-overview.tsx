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
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Cloud,
  CloudOff,
  MoreHorizontal,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Sample data for cloud providers
const cloudProviders = [
  { name: 'AWS', value: 55 },
  { name: 'Azure', value: 30 },
  { name: 'GCP', value: 15 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

// Sample data for workload history
const workloadHistoryData = [
  { time: '00:00', aws: 45, azure: 25, gcp: 10 },
  { time: '04:00', aws: 40, azure: 28, gcp: 12 },
  { time: '08:00', aws: 52, azure: 30, gcp: 13 },
  { time: '12:00', aws: 58, azure: 32, gcp: 15 },
  { time: '16:00', aws: 55, azure: 35, gcp: 17 },
  { time: '20:00', aws: 50, azure: 30, gcp: 15 },
];

// Sample data for systems status
const systemsStatus = [
  {
    id: 'sys-001',
    name: 'Production Kubernetes Cluster',
    provider: 'AWS',
    status: 'healthy',
    usedResources: 78,
    region: 'us-east-1',
    uptime: '99.98%',
  },
  {
    id: 'sys-002',
    name: 'Storage Cluster',
    provider: 'AWS',
    status: 'healthy',
    usedResources: 65,
    region: 'us-east-1',
    uptime: '99.99%',
  },
  {
    id: 'sys-003',
    name: 'Development Environment',
    provider: 'Azure',
    status: 'healthy',
    usedResources: 42,
    region: 'eastus',
    uptime: '99.95%',
  },
  {
    id: 'sys-004',
    name: 'Database Cluster',
    provider: 'GCP',
    status: 'warning',
    usedResources: 88,
    region: 'us-central1',
    uptime: '99.92%',
  },
  {
    id: 'sys-005',
    name: 'Staging Environment',
    provider: 'Azure',
    status: 'maintenance',
    usedResources: 35,
    region: 'westeurope',
    uptime: '99.90%',
  },
];

export function WorkloadOverview() {
  // Get status badge based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Healthy
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-orange-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Warning
          </Badge>
        );
      case 'critical':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Critical
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-blue-500">
            <Clock className="mr-1 h-3 w-3" />
            Maintenance
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <CloudOff className="mr-1 h-3 w-3" />
            Offline
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get provider icon
  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'AWS':
        return (
          <svg
            className="h-4 w-4 text-[#FF9900]"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-label="AWS"
            aria-hidden="true"
          >
            <path d="M15.63 14.4h-2.89V21h2.89V14.4zM15.63 11.8a1.53 1.53 0 0 0-1.52-1.52 1.5 1.5 0 0 0-1.37 2.2a1.49 1.49 0 0 0 1.37.85a1.53 1.53 0 0 0 1.52-1.52z" />
            <path d="M23 9.3v-.2c-.7.1-1.5.1-2.2.1-1 0-2-.1-3-.3h-.1l-1.2-2.7H16l-1.2 2.6h-.4c-.5 0-1.1-.1-1.4-.1-.3-.1-.6-.1-.8-.2-.2-.1-.4-.2-.6-.3c-.2-.2-.4-.3-.5-.5c-.1-.2-.1-.4-.1-.7c0-.2.1-.4.1-.6c.1-.2.2-.3.4-.5c.1-.1.3-.2.5-.3c.2-.1.4-.1.6-.2c.3 0 .5-.1.8-.1h3.6V3.7h-3.8c-.9 0-1.7.1-2.5.3c-.7.2-1.4.6-1.9 1c-.5.5-.9 1-1.2 1.6c-.4.6-.5 1.4-.5 2.2c0 .8.1 1.5.4 2.1c.3.6.7 1.1 1.1 1.5c.5.4 1.1.8 1.7 1c.7.2 1.5.3 2.3.3h.5l-3.1 7.1h2.9l.9-2.1h3.5c.3.7.6 1.4.9 2.1h3.1l-3.8-8.7c.6-.2 1.1-.5 1.5-.9c.5-.4.9-.9 1.3-1.4c.4-.6.6-1.2.8-1.8c.2-.8.3-1.6.2-2.4zM17 15.1h-1.4c.4-1 .7-2 1-3c.4 1 .7 2 1 3z" />
            <path d="M6.9 11.5A6.81 6.81 0 0 0 8 9.3c0-.2-.2-.3-.4-.2-1 .7-1.8 1.7-2.5 2.7c-.1.1-.1.1-.2.1h-.3c-.2-.1-.3.1-.2.2c.7.8 1.5 1.5 2.4 2.1c.1.1.3 0 .3-.1a9.3 9.3 0 0 0-.2-2.6" />
          </svg>
        );
      case 'Azure':
        return (
          <svg
            className="h-4 w-4 text-[#0078D4]"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-label="Azure"
            aria-hidden="true"
          >
            <path d="M13.54 12.4h5.42v5.16H13.54zm0-5.36h5.42v5.16H13.54zM7.95 12.4h5.42v5.16H7.95zm0-5.36h5.42v5.16H7.95zM2 20h20v2H2z" />
            <path d="M2 2h20v2H2z" />
            <path d="M16 2h6v20h-6M2 2h6v20H2" />
          </svg>
        );
      case 'GCP':
        return (
          <svg
            className="h-4 w-4 text-[#4285F4]"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-label="GCP"
            aria-hidden="true"
          >
            <path d="M12.95 11.95L8 17.91l4.95 5.54 4.95-5.54-4.95-5.96zm0-11.95L3 17.91l4.95 5.54 4.95-5.54L7.55 12 12 7.5l4.45 4.5-5.05 5.91 1.5 1.68 6-7.09L12.95 0z" />
          </svg>
        );
      default:
        return <Cloud className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  Workload Distribution
                </CardTitle>
                <CardDescription>
                  Resource allocation across cloud providers
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>View Details</DropdownMenuItem>
                  <DropdownMenuItem>Export Data</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={workloadHistoryData}
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
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="aws"
                    stroke="#0088FE"
                    name="AWS"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="azure"
                    stroke="#00C49F"
                    name="Azure"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="gcp"
                    stroke="#FFBB28"
                    name="GCP"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Systems Status</CardTitle>
            <CardDescription>
              Current status of workload hosting systems
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {systemsStatus.map(system => (
                <div
                  key={system.id}
                  className="p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2">
                      {getProviderIcon(system.provider)}
                      <div>
                        <p className="font-medium text-sm">{system.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {system.provider} • {system.region} • {system.uptime}{' '}
                          uptime
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(system.status)}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">
                        Resource usage
                      </span>
                      <span>{system.usedResources}%</span>
                    </div>
                    <Progress
                      value={system.usedResources}
                      className="h-1"
                      indicatorClassName={
                        system.usedResources >= 90
                          ? 'bg-destructive'
                          : system.usedResources >= 75
                            ? 'bg-orange-500'
                            : system.usedResources >= 50
                              ? 'bg-amber-500'
                              : 'bg-green-500'
                      }
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cloud Providers</CardTitle>
            <CardDescription>Distribution by provider</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={cloudProviders}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {cloudProviders.map((entry) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[cloudProviders.findIndex(p => p.name === entry.name) % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Workload']}
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

            <div className="mt-4 space-y-2">
              {cloudProviders.map((provider) => (
                <div key={provider.name} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: COLORS[cloudProviders.findIndex(p => p.name === provider.name) % COLORS.length] }}
                    />
                    <span className="text-sm">{provider.name}</span>
                  </div>
                  <span className="text-sm">{provider.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Cost Analysis</CardTitle>
            <CardDescription>Monthly cloud expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>AWS</span>
                  <span className="font-medium">$12,450</span>
                </div>
                <Progress
                  value={62}
                  className="h-1.5"
                  indicatorClassName="bg-[#FF9900]"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>+8% from last month</span>
                  <span>62% of budget</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Azure</span>
                  <span className="font-medium">$6,320</span>
                </div>
                <Progress
                  value={45}
                  className="h-1.5"
                  indicatorClassName="bg-[#0078D4]"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>-3% from last month</span>
                  <span>45% of budget</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>GCP</span>
                  <span className="font-medium">$2,840</span>
                </div>
                <Progress
                  value={28}
                  className="h-1.5"
                  indicatorClassName="bg-[#4285F4]"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>+2% from last month</span>
                  <span>28% of budget</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <span className="text-sm font-medium">Total Monthly Cost</span>
              <span className="text-lg font-bold">$21,610</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
