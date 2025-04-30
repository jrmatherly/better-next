'use client';

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
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
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

// Sample data for metrics
const generateHourlyData = (
  hours: number,
  baseValue: number,
  fluctuation: number
) => {
  const data = [];
  const now = new Date();

  for (let i = hours; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const value =
      baseValue +
      Math.sin(i / 2) * fluctuation +
      (Math.random() * fluctuation) / 2;
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      value: Math.max(0, Math.min(100, value)),
      responseTime: Math.max(
        50,
        Math.min(500, 150 + Math.sin(i / 3) * 100 + Math.random() * 50)
      ),
      throughput: Math.max(
        10,
        Math.min(200, 80 + Math.cos(i / 4) * 40 + Math.random() * 30)
      ),
      errors: Math.floor(
        Math.max(0, Math.min(10, 2 + Math.sin(i / 6) * 2 + Math.random() * 2))
      ),
    });
  }

  return data;
};

const generateDailyData = (
  days: number,
  baseValue: number,
  fluctuation: number
) => {
  const data = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const value =
      baseValue +
      Math.sin(i / 3) * fluctuation +
      (Math.random() * fluctuation) / 2;
    data.push({
      date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      value: Math.max(0, Math.min(100, value)),
      responseTime: Math.max(
        50,
        Math.min(500, 150 + Math.sin(i / 4) * 100 + Math.random() * 50)
      ),
      throughput: Math.max(
        10,
        Math.min(200, 80 + Math.cos(i / 5) * 40 + Math.random() * 30)
      ),
      errors: Math.floor(
        Math.max(0, Math.min(10, 2 + Math.sin(i / 7) * 2 + Math.random() * 2))
      ),
    });
  }

  return data;
};

const resourceUtilizationData = [
  { name: 'CPU', value: 67 },
  { name: 'Memory', value: 82 },
  { name: 'Disk', value: 58 },
  { name: 'Network', value: 45 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Props interface
interface PerformanceMetricsProps {
  timeRange: string;
}

export function PerformanceMetrics({ timeRange }: PerformanceMetricsProps) {
  const [selectedServer, setSelectedServer] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('cpu');

  // Choose data based on time range
  const metricsData =
    timeRange === '24h'
      ? generateHourlyData(24, 65, 15)
      : generateDailyData(7, 65, 15);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="space-y-1">
            <CardTitle>System Performance</CardTitle>
            <CardDescription>
              Key metrics across all systems over time
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select
              defaultValue={selectedServer}
              onValueChange={setSelectedServer}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select server" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Servers</SelectItem>
                <SelectItem value="web-01">Web Server 01</SelectItem>
                <SelectItem value="web-02">Web Server 02</SelectItem>
                <SelectItem value="db-01">Database Server 01</SelectItem>
                <SelectItem value="db-02">Database Server 02</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="cpu">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="cpu">CPU</TabsTrigger>
              <TabsTrigger value="memory">Memory</TabsTrigger>
              <TabsTrigger value="disk">Disk I/O</TabsTrigger>
              <TabsTrigger value="network">Network</TabsTrigger>
            </TabsList>

            <TabsContent value="cpu" className="space-y-4">
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={metricsData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey={timeRange === '24h' ? 'time' : 'date'}
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
                        'CPU Usage',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1) / 20%)"
                      strokeWidth={2}
                      name="CPU Usage"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Avg Usage
                  </span>
                  <span className="text-2xl font-bold">67%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Peak</span>
                  <span className="text-2xl font-bold">85%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Current</span>
                  <span className="text-2xl font-bold">72%</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="memory" className="space-y-4">
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={metricsData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey={timeRange === '24h' ? 'time' : 'date'}
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
                        'Memory Usage',
                      ]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2) / 20%)"
                      strokeWidth={2}
                      name="Memory Usage"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Avg Usage
                  </span>
                  <span className="text-2xl font-bold">82%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Peak</span>
                  <span className="text-2xl font-bold">93%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Current</span>
                  <span className="text-2xl font-bold">86%</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="disk" className="space-y-4">
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={metricsData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey={timeRange === '24h' ? 'time' : 'date'}
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
                      unit="MB/s"
                      domain={[0, 200]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))',
                      }}
                      formatter={(value: number) => [
                        `${value.toFixed(1)} MB/s`,
                        'Disk I/O',
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="throughput"
                      stroke="hsl(var(--chart-3))"
                      strokeWidth={2}
                      dot={false}
                      name="Disk I/O"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Avg I/O</span>
                  <span className="text-2xl font-bold">87 MB/s</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Peak</span>
                  <span className="text-2xl font-bold">145 MB/s</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Usage</span>
                  <span className="text-2xl font-bold">58%</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4">
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={metricsData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                    />
                    <XAxis
                      dataKey={timeRange === '24h' ? 'time' : 'date'}
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
                      unit=" ms"
                      domain={[0, 500]}
                      yAxisId="left"
                    />
                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      orientation="right"
                      yAxisId="right"
                      domain={[0, 10]}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="responseTime"
                      stroke="hsl(var(--chart-4))"
                      strokeWidth={2}
                      dot={false}
                      name="Response Time"
                      yAxisId="left"
                    />
                    <Line
                      type="monotone"
                      dataKey="errors"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      dot={false}
                      name="Errors"
                      yAxisId="right"
                    />
                    <Legend />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Avg Response
                  </span>
                  <span className="text-2xl font-bold">145 ms</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Error Rate
                  </span>
                  <span className="text-2xl font-bold">0.8%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">
                    Throughput
                  </span>
                  <span className="text-2xl font-bold">1.2K req/s</span>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resource Utilization</CardTitle>
          <CardDescription>
            Current utilization across different resource types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resourceUtilizationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {resourceUtilizationData.map((entry) => (
                    <Cell key={entry.name} fill={COLORS[resourceUtilizationData.indexOf(entry) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`${value}%`, 'Utilization']}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--foreground))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Error Analysis</CardTitle>
          <CardDescription>System errors categorized by type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Network', errors: 42 },
                  { name: 'Database', errors: 28 },
                  { name: 'Application', errors: 67 },
                  { name: 'Authentication', errors: 16 },
                  { name: 'Storage', errors: 23 },
                ]}
                margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Bar
                  dataKey="errors"
                  fill="hsl(var(--destructive))"
                  barSize={30}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
