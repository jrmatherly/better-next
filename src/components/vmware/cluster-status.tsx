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
import {
  AlertTriangle,
  CheckCircle2,
  CpuIcon,
  HardDrive,
  MemoryStick as Memory,
  Server,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface ClusterStatusProps {
  detailed?: boolean;
}

// Sample cluster data
const clusterData = {
  name: 'Production Cluster',
  status: 'healthy',
  hosts: 4,
  vms: 45,
  cpuTotal: 128,
  cpuUsed: 92,
  memoryTotal: 512,
  memoryUsed: 384,
  storageTotal: 8192,
  storageUsed: 4915,
};

// Data for pie charts
const resourceData = [
  { name: 'Used', value: clusterData.cpuUsed, color: '#3b82f6' },
  {
    name: 'Free',
    value: clusterData.cpuTotal - clusterData.cpuUsed,
    color: '#e2e8f0',
  },
];

const memoryData = [
  { name: 'Used', value: clusterData.memoryUsed, color: '#10b981' },
  {
    name: 'Free',
    value: clusterData.memoryTotal - clusterData.memoryUsed,
    color: '#e2e8f0',
  },
];

const storageData = [
  { name: 'Used', value: clusterData.storageUsed, color: '#f59e0b' },
  {
    name: 'Free',
    value: clusterData.storageTotal - clusterData.storageUsed,
    color: '#e2e8f0',
  },
];

// Host status data
const hostData = [
  {
    name: 'esx01.example.com',
    status: 'healthy',
    vms: 12,
    cpuUsage: 78,
    memoryUsage: 82,
    storageUsage: 67,
  },
  {
    name: 'esx02.example.com',
    status: 'healthy',
    vms: 15,
    cpuUsage: 65,
    memoryUsage: 70,
    storageUsage: 55,
  },
  {
    name: 'esx03.example.com',
    status: 'warning',
    vms: 18,
    cpuUsage: 92,
    memoryUsage: 88,
    storageUsage: 75,
  },
  {
    name: 'esx04.example.com',
    status: 'healthy',
    vms: 0,
    cpuUsage: 5,
    memoryUsage: 10,
    storageUsage: 25,
  },
];

export function ClusterStatus({ detailed = false }: ClusterStatusProps) {
  // Calculate percentages
  const cpuPercentage = Math.round(
    (clusterData.cpuUsed / clusterData.cpuTotal) * 100
  );
  const memoryPercentage = Math.round(
    (clusterData.memoryUsed / clusterData.memoryTotal) * 100
  );
  const storagePercentage = Math.round(
    (clusterData.storageUsed / clusterData.storageTotal) * 100
  );

  // Get progress bar class based on usage
  const getProgressClass = (percentage: number) => {
    if (percentage >= 90) return 'bg-destructive';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-amber-500';
    return 'bg-green-500';
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-500">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Healthy
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-amber-500">
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
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>VMware Cluster Status</CardTitle>
              <CardDescription>
                Production infrastructure overview
              </CardDescription>
            </div>
            {getStatusBadge(clusterData.status)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col items-center p-4 rounded-md bg-muted/50">
              <Server className="h-6 w-6 text-muted-foreground mb-1" />
              <span className="text-2xl font-bold">{clusterData.hosts}</span>
              <span className="text-xs text-muted-foreground">ESXi Hosts</span>
            </div>
            <div className="flex flex-col items-center p-4 rounded-md bg-muted/50">
              <div className="flex items-center">
                <Server className="h-6 w-6 text-muted-foreground mb-1" />
              </div>
              <span className="text-2xl font-bold">{clusterData.vms}</span>
              <span className="text-xs text-muted-foreground">
                Virtual Machines
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <CpuIcon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">CPU</span>
                </div>
                <span className="text-sm">{cpuPercentage}% used</span>
              </div>
              <Progress
                value={cpuPercentage}
                className="h-2"
                indicatorClassName={getProgressClass(cpuPercentage)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {clusterData.cpuUsed} / {clusterData.cpuTotal} vCPUs
                </span>
                <span>
                  {clusterData.cpuTotal - clusterData.cpuUsed} available
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Memory className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Memory</span>
                </div>
                <span className="text-sm">{memoryPercentage}% used</span>
              </div>
              <Progress
                value={memoryPercentage}
                className="h-2"
                indicatorClassName={getProgressClass(memoryPercentage)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {clusterData.memoryUsed} / {clusterData.memoryTotal} GB
                </span>
                <span>
                  {clusterData.memoryTotal - clusterData.memoryUsed} GB
                  available
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Storage</span>
                </div>
                <span className="text-sm">{storagePercentage}% used</span>
              </div>
              <Progress
                value={storagePercentage}
                className="h-2"
                indicatorClassName={getProgressClass(storagePercentage)}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {(clusterData.storageUsed / 1024).toFixed(1)} /{' '}
                  {(clusterData.storageTotal / 1024).toFixed(1)} TB
                </span>
                <span>
                  {(
                    (clusterData.storageTotal - clusterData.storageUsed) /
                    1024
                  ).toFixed(1)}{' '}
                  TB available
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {detailed && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Resource Utilization</CardTitle>
              <CardDescription>Cluster-wide resource usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={resourceData}
                      cx="25%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {resourceData.map(entry => (
                        <Cell key={`cpu-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Pie
                      data={memoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {memoryData.map(entry => (
                        <Cell key={`memory-${entry.name}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Pie
                      data={storageData}
                      cx="75%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {storageData.map(entry => (
                        <Cell
                          key={`storage-${entry.name}`}
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value, 'Units']}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 text-center mt-4">
                <div>
                  <h4 className="text-sm font-medium">CPU</h4>
                  <p className="text-sm text-muted-foreground">
                    {cpuPercentage}% utilized
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Memory</h4>
                  <p className="text-sm text-muted-foreground">
                    {memoryPercentage}% utilized
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Storage</h4>
                  <p className="text-sm text-muted-foreground">
                    {storagePercentage}% utilized
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Host Servers</CardTitle>
              <CardDescription>
                ESXi host status and utilization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hostData.map(host => (
                <div
                  key={host.name}
                  className="p-3 border rounded-md space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{host.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(host.status)}
                      <span className="text-sm text-muted-foreground">
                        {host.vms} VMs
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">CPU</span>
                      <span>{host.cpuUsage}%</span>
                    </div>
                    <Progress
                      value={host.cpuUsage}
                      className="h-1"
                      indicatorClassName={getProgressClass(host.cpuUsage)}
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Memory</span>
                      <span>{host.memoryUsage}%</span>
                    </div>
                    <Progress
                      value={host.memoryUsage}
                      className="h-1"
                      indicatorClassName={getProgressClass(host.memoryUsage)}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
