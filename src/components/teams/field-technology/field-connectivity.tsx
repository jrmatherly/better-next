'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, ArrowDown, BarChart3, Clock, Signal } from 'lucide-react';
import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Sample data for connectivity performance
const connectivityData = [
  { time: '00:00', bandwidth: 85, latency: 45, reliability: 98 },
  { time: '04:00', bandwidth: 80, latency: 50, reliability: 97 },
  { time: '08:00', bandwidth: 60, latency: 75, reliability: 92 },
  { time: '12:00', bandwidth: 45, latency: 95, reliability: 85 },
  { time: '16:00', bandwidth: 65, latency: 70, reliability: 94 },
  { time: '20:00', bandwidth: 75, latency: 55, reliability: 96 },
];

// Sample data for connection types
const connectionTypes = [
  { name: 'Fiber', value: 35 },
  { name: '5G', value: 25 },
  { name: '4G/LTE', value: 28 },
  { name: 'Satellite', value: 12 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Sample carriers data
const carriers = [
  {
    id: 'ca-001',
    name: 'AT&T',
    devices: 45,
    uptime: '99.7%',
    averageLatency: 38,
    averageBandwidth: 125,
    dataUsage: 1.2, // TB
  },
  {
    id: 'ca-002',
    name: 'Verizon',
    devices: 52,
    uptime: '99.8%',
    averageLatency: 35,
    averageBandwidth: 135,
    dataUsage: 1.5, // TB
  },
  {
    id: 'ca-003',
    name: 'T-Mobile',
    devices: 28,
    uptime: '99.5%',
    averageLatency: 42,
    averageBandwidth: 115,
    dataUsage: 0.8, // TB
  },
  {
    id: 'ca-004',
    name: 'Starlink',
    devices: 13,
    uptime: '98.9%',
    averageLatency: 65,
    averageBandwidth: 95,
    dataUsage: 0.6, // TB
  },
];

// Sample issues data
const connectivityIssues = [
  {
    id: 'issue-001',
    location: 'Southwest Field Office',
    device: 'Router SW-R01',
    type: 'Signal Degradation',
    startTime: new Date('2025-04-15T08:45:00'),
    status: 'investigating',
    severity: 'medium',
  },
  {
    id: 'issue-002',
    location: 'Central Field Station',
    device: 'Primary Gateway CF-G01',
    type: 'Hardware Failure',
    startTime: new Date('2025-04-14T16:30:00'),
    status: 'in-progress',
    severity: 'high',
  },
  {
    id: 'issue-003',
    location: 'Mountain Region Outpost',
    device: 'Satellite Link MR-S01',
    type: 'Weather Interference',
    startTime: new Date('2025-04-15T12:15:00'),
    status: 'monitoring',
    severity: 'low',
  },
];

interface FieldConnectivityProps {
  searchQuery: string;
}

export function FieldConnectivity({ searchQuery }: FieldConnectivityProps) {
  const [timeRange, setTimeRange] = useState('24h');

  // Get issue severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return null;
    }
  };

  // Get issue status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'investigating':
        return (
          <Badge className="bg-blue-500">
            <Clock className="mr-1 h-3 w-3" />
            Investigating
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-amber-500">
            <Activity className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case 'monitoring':
        return (
          <Badge className="bg-green-500">
            <Signal className="mr-1 h-3 w-3" />
            Monitoring
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Resolved
          </Badge>
        );
      default:
        return null;
    }
  };

  // Filter issues based on search query
  const filteredIssues = connectivityIssues.filter(
    issue =>
      issue.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.device.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Network Performance</CardTitle>
                <CardDescription>Bandwidth and latency metrics</CardDescription>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6h">Last 6 Hours</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={connectivityData}
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
                    yAxisId="left"
                    tick={{
                      fontSize: 12,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    domain={[0, 100]}
                    label={{
                      value: 'Bandwidth %',
                      angle: -90,
                      position: 'insideLeft',
                      style: {
                        textAnchor: 'middle',
                        fill: 'hsl(var(--muted-foreground))',
                      },
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{
                      fontSize: 12,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    domain={[0, 100]}
                    label={{
                      value: 'Latency (ms)',
                      angle: 90,
                      position: 'insideRight',
                      style: {
                        textAnchor: 'middle',
                        fill: 'hsl(var(--muted-foreground))',
                      },
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bandwidth"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1) / 20%)"
                    strokeWidth={2}
                    name="Bandwidth"
                    yAxisId="left"
                  />
                  <Area
                    type="monotone"
                    dataKey="latency"
                    stroke="hsl(var(--chart-2))"
                    fill="hsl(var(--chart-2) / 20%)"
                    strokeWidth={2}
                    name="Latency"
                    yAxisId="right"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Connection Types</CardTitle>
            <CardDescription>
              Distribution by connection technology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={connectionTypes}
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
                    {connectionTypes.map(entry => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={
                          COLORS[connectionTypes.indexOf(entry) % COLORS.length]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [`${value}%`, 'Percentage']}
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

            <div className="mt-4 grid grid-cols-2 gap-2">
              {connectionTypes.map(type => (
                <div key={type.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[connectionTypes.indexOf(type) % COLORS.length],
                    }}
                  />
                  <span className="text-sm">
                    {type.name}: {type.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Carrier Performance</CardTitle>
          <CardDescription>
            Metrics for cellular and network carriers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="bandwidth">Bandwidth</TabsTrigger>
              <TabsTrigger value="latency">Latency</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {carriers.map(carrier => (
                  <div
                    key={carrier.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-medium">{carrier.name}</h3>
                      <Badge variant="outline">{carrier.devices} Devices</Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Signal className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Uptime</span>
                        </div>
                        <span>{carrier.uptime}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Latency</span>
                        </div>
                        <span>{carrier.averageLatency} ms</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <ArrowDown className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Bandwidth
                          </span>
                        </div>
                        <span>{carrier.averageBandwidth} Mbps</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <BarChart3 className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">
                            Data Usage
                          </span>
                        </div>
                        <span>{carrier.dataUsage} TB</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="bandwidth">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={carriers}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
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
                      label={{
                        value: 'Bandwidth (Mbps)',
                        angle: -90,
                        position: 'insideLeft',
                        style: {
                          textAnchor: 'middle',
                          fill: 'hsl(var(--muted-foreground))',
                        },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="averageBandwidth"
                      name="Avg. Bandwidth (Mbps)"
                      fill="hsl(var(--chart-1))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>

            <TabsContent value="latency">
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={carriers}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey="name"
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
                      label={{
                        value: 'Latency (ms)',
                        angle: -90,
                        position: 'insideLeft',
                        style: {
                          textAnchor: 'middle',
                          fill: 'hsl(var(--muted-foreground))',
                        },
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Legend />
                    <Bar
                      dataKey="averageLatency"
                      name="Avg. Latency (ms)"
                      fill="hsl(var(--chart-2))"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Connectivity Issues</CardTitle>
          <CardDescription>
            Current network and connectivity problems
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredIssues.length > 0 ? (
            <div className="space-y-4">
              {filteredIssues.map(issue => (
                <div key={issue.id} className="border rounded-md p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{issue.type}</h3>
                      <div className="text-sm text-muted-foreground">
                        <span>{issue.location}</span>
                        <span> • </span>
                        <span>{issue.device}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getSeverityBadge(issue.severity)}
                      {getStatusBadge(issue.status)}
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Started:</span>
                      <span>{issue.startTime.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span>
                        {' '}
                        {formatDuration(
                          new Date().getTime() - issue.startTime.getTime()
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6">
              <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
              <h3 className="text-lg font-medium">No Active Issues</h3>
              <p className="text-sm text-muted-foreground text-center mt-1">
                All connectivity systems are currently operating normally
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper function to format duration
function formatDuration(ms: number) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  return `${minutes}m`;
}

// Custom CheckCircle component
function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="Check Circle"
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
