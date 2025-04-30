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
import type { VM } from '@/types/vmware';
import // biome-ignore lint/correctness/noUnusedImports: not used directly
React, { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Generate sample performance data
const generatePerformanceData = (
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

// Generate data for different metrics
const generateCpuData = (vm: VM) => {
  const baseValue = vm.status === 'running' ? 20 + Math.random() * 40 : 0;
  return generatePerformanceData(24, baseValue, 15);
};

const generateMemoryData = (vm: VM) => {
  const baseValue = vm.status === 'running' ? 30 + Math.random() * 30 : 0;
  return generatePerformanceData(24, baseValue, 10);
};

const generateDiskData = (vm: VM) => {
  const baseValue = vm.status === 'running' ? 10 + Math.random() * 20 : 0;
  return generatePerformanceData(24, baseValue, 8);
};

const generateNetworkData = (vm: VM) => {
  const baseValue = vm.status === 'running' ? 5 + Math.random() * 15 : 0;
  return generatePerformanceData(24, baseValue, 10);
};

interface VmPerformanceProps {
  vm: VM;
}

export function VmPerformance({ vm }: VmPerformanceProps) {
  const [timeRange, setTimeRange] = useState('24h');

  // Generate data for this VM
  const cpuData = generateCpuData(vm);
  const memoryData = generateMemoryData(vm);
  const diskData = generateDiskData(vm);
  const networkData = generateNetworkData(vm);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Resource utilization over time</CardDescription>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1h">Last Hour</SelectItem>
              <SelectItem value="6h">Last 6 Hours</SelectItem>
              <SelectItem value="24h">Last 24 Hours</SelectItem>
              <SelectItem value="7d">Last 7 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cpu">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="cpu">CPU</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="disk">Disk</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
          </TabsList>

          <TabsContent value="cpu" className="space-y-4">
            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
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
                      background: 'hsl(var(--card))',
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

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Current</span>
                <span className="text-2xl font-bold">
                  {vm.performanceMetrics.cpuUsage}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Average</span>
                <span className="text-2xl font-bold">
                  {vm.status === 'running' ? '32%' : '0%'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Peak</span>
                <span className="text-2xl font-bold">
                  {vm.status === 'running' ? '78%' : '0%'}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="memory" className="space-y-4">
            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={memoryData}
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
                      background: 'hsl(var(--card))',
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

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Current</span>
                <span className="text-2xl font-bold">
                  {vm.performanceMetrics.memoryUsage}%
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Average</span>
                <span className="text-2xl font-bold">
                  {vm.status === 'running' ? '45%' : '0%'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Peak</span>
                <span className="text-2xl font-bold">
                  {vm.status === 'running' ? '65%' : '0%'}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="disk" className="space-y-4">
            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={diskData}
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
                    unit=" IOPS"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: number) => [
                      `${value.toFixed(1)} IOPS`,
                      'Disk I/O',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-3))"
                    strokeWidth={2}
                    dot={false}
                    name="Disk I/O"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Current</span>
                <span className="text-2xl font-bold">
                  {vm.performanceMetrics.diskIops} IOPS
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Average</span>
                <span className="text-2xl font-bold">
                  {vm.status === 'running' ? '25 IOPS' : '0 IOPS'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Peak</span>
                <span className="text-2xl font-bold">
                  {vm.status === 'running' ? '85 IOPS' : '0 IOPS'}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="network" className="space-y-4">
            <div className="h-[250px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={networkData}
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
                    unit=" Mbps"
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: number) => [
                      `${value.toFixed(1)} Mbps`,
                      'Network Throughput',
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--chart-4))"
                    strokeWidth={2}
                    dot={false}
                    name="Network Throughput"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Current</span>
                <span className="text-2xl font-bold">
                  {vm.performanceMetrics.networkThroughput} Mbps
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Average</span>
                <span className="text-2xl font-bold">
                  {vm.status === 'running' ? '12 Mbps' : '0 Mbps'}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Peak</span>
                <span className="text-2xl font-bold">
                  {vm.status === 'running' ? '45 Mbps' : '0 Mbps'}
                </span>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
