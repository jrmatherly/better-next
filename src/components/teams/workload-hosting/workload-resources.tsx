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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  CloudOff,
  MoreHorizontal,
  Plus,
  Search,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Sample data for compute resources
const computeResources = [
  {
    id: 'c-001',
    name: 'web-cluster-prod',
    type: 'Kubernetes',
    provider: 'AWS',
    region: 'us-east-1',
    status: 'healthy',
    cpu: 32,
    memory: 128,
    cpuUtilization: 68,
    memoryUtilization: 72,
    nodes: 4,
  },
  {
    id: 'c-002',
    name: 'app-servers-prod',
    type: 'EC2',
    provider: 'AWS',
    region: 'us-east-1',
    status: 'healthy',
    cpu: 16,
    memory: 64,
    cpuUtilization: 75,
    memoryUtilization: 80,
    nodes: 2,
  },
  {
    id: 'c-003',
    name: 'data-processing',
    type: 'AKS',
    provider: 'Azure',
    region: 'eastus',
    status: 'warning',
    cpu: 48,
    memory: 192,
    cpuUtilization: 88,
    memoryUtilization: 75,
    nodes: 6,
  },
  {
    id: 'c-004',
    name: 'ml-training',
    type: 'GKE',
    provider: 'GCP',
    region: 'us-central1',
    status: 'healthy',
    cpu: 64,
    memory: 256,
    cpuUtilization: 45,
    memoryUtilization: 60,
    nodes: 8,
  },
  {
    id: 'c-005',
    name: 'web-cluster-staging',
    type: 'Kubernetes',
    provider: 'AWS',
    region: 'us-west-2',
    status: 'maintenance',
    cpu: 16,
    memory: 64,
    cpuUtilization: 30,
    memoryUtilization: 45,
    nodes: 2,
  },
];

// Sample data for storage resources
const storageResources = [
  {
    id: 's-001',
    name: 'app-storage-prod',
    type: 'S3',
    provider: 'AWS',
    region: 'us-east-1',
    status: 'healthy',
    capacity: 2048,
    used: 1536,
    buckets: 12,
  },
  {
    id: 's-002',
    name: 'database-backups',
    type: 'EBS',
    provider: 'AWS',
    region: 'us-east-1',
    status: 'healthy',
    capacity: 5120,
    used: 3584,
    volumes: 8,
  },
  {
    id: 's-003',
    name: 'media-storage',
    type: 'Azure Blob',
    provider: 'Azure',
    region: 'eastus',
    status: 'healthy',
    capacity: 10240,
    used: 7168,
    containers: 6,
  },
  {
    id: 's-004',
    name: 'analytics-data',
    type: 'GCS',
    provider: 'GCP',
    region: 'us-central1',
    status: 'warning',
    capacity: 4096,
    used: 3686,
    buckets: 4,
  },
];

// Sample data for database resources
const databaseResources = [
  {
    id: 'd-001',
    name: 'prod-main-db',
    type: 'RDS PostgreSQL',
    provider: 'AWS',
    region: 'us-east-1',
    status: 'healthy',
    size: 'db.r6g.2xlarge',
    storage: 500,
    connections: 120,
    utilizationCpu: 65,
    utilizationMem: 70,
  },
  {
    id: 'd-002',
    name: 'auth-cache',
    type: 'ElastiCache Redis',
    provider: 'AWS',
    region: 'us-east-1',
    status: 'healthy',
    size: 'cache.m6g.large',
    storage: 64,
    connections: 850,
    utilizationCpu: 72,
    utilizationMem: 68,
  },
  {
    id: 'd-003',
    name: 'analytics-db',
    type: 'Azure SQL',
    provider: 'Azure',
    region: 'eastus',
    status: 'warning',
    size: 'GP_Gen5_8',
    storage: 1024,
    connections: 45,
    utilizationCpu: 85,
    utilizationMem: 78,
  },
  {
    id: 'd-004',
    name: 'document-store',
    type: 'MongoDB Atlas',
    provider: 'GCP',
    region: 'us-central1',
    status: 'healthy',
    size: 'M40',
    storage: 750,
    connections: 65,
    utilizationCpu: 40,
    utilizationMem: 55,
  },
];

// Sample data for resources usage over time
const resourcesUsageData = [
  { month: 'Jan', compute: 45, storage: 30, database: 25 },
  { month: 'Feb', compute: 50, storage: 35, database: 30 },
  { month: 'Mar', compute: 55, storage: 40, database: 30 },
  { month: 'Apr', compute: 60, storage: 45, database: 35 },
  { month: 'May', compute: 65, storage: 50, database: 40 },
  { month: 'Jun', compute: 70, storage: 55, database: 45 },
];

export function WorkloadResources() {
  const [searchQuery, setSearchQuery] = useState('');

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
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resource Utilization</CardTitle>
          <CardDescription>
            Monthly usage trends by resource type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={resourcesUsageData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="month"
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
                <Legend />
                <Bar
                  dataKey="compute"
                  name="Compute"
                  fill="hsl(var(--chart-1))"
                />
                <Bar
                  dataKey="storage"
                  name="Storage"
                  fill="hsl(var(--chart-2))"
                />
                <Bar
                  dataKey="database"
                  name="Database"
                  fill="hsl(var(--chart-3))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="compute">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="compute">Compute Resources</TabsTrigger>
          <TabsTrigger value="storage">Storage Resources</TabsTrigger>
          <TabsTrigger value="database">Database Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="compute" className="space-y-4">
          <div className="flex justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search compute resources..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Compute
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CPU</TableHead>
                  <TableHead>Memory</TableHead>
                  <TableHead>Nodes</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {computeResources
                  .filter(r =>
                    r.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(resource => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">
                        {resource.name}
                      </TableCell>
                      <TableCell>{resource.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{resource.provider}</span>
                          <span className="text-xs text-muted-foreground">
                            ({resource.region})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(resource.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex gap-2 items-center">
                            <Progress
                              value={resource.cpuUtilization}
                              className="h-1 w-16"
                              indicatorClassName={
                                resource.cpuUtilization >= 85
                                  ? 'bg-destructive'
                                  : resource.cpuUtilization >= 70
                                    ? 'bg-orange-500'
                                    : 'bg-green-500'
                              }
                            />
                            <span className="text-xs">
                              {resource.cpuUtilization}%
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex gap-2 items-center">
                            <Progress
                              value={resource.memoryUtilization}
                              className="h-1 w-16"
                              indicatorClassName={
                                resource.memoryUtilization >= 85
                                  ? 'bg-destructive'
                                  : resource.memoryUtilization >= 70
                                    ? 'bg-orange-500'
                                    : 'bg-green-500'
                              }
                            />
                            <span className="text-xs">
                              {resource.memoryUtilization}%
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{resource.nodes}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Scale</DropdownMenuItem>
                            <DropdownMenuItem>Restart</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="storage" className="space-y-4">
          <div className="flex justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search storage resources..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Storage
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {storageResources
                  .filter(r =>
                    r.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(resource => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">
                        {resource.name}
                      </TableCell>
                      <TableCell>{resource.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{resource.provider}</span>
                          <span className="text-xs text-muted-foreground">
                            ({resource.region})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(resource.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex gap-2 items-center">
                            <Progress
                              value={(resource.used / resource.capacity) * 100}
                              className="h-1 w-16"
                              indicatorClassName={
                                resource.used / resource.capacity >= 0.85
                                  ? 'bg-destructive'
                                  : resource.used / resource.capacity >= 0.7
                                    ? 'bg-orange-500'
                                    : 'bg-green-500'
                              }
                            />
                            <span className="text-xs">
                              {Math.round(
                                (resource.used / resource.capacity) * 100
                              )}
                              %
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {Math.round(resource.capacity / 1024)} TB
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Expand</DropdownMenuItem>
                            <DropdownMenuItem>View Objects</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <div className="flex justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search database resources..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Database
            </Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>CPU</TableHead>
                  <TableHead>Memory</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {databaseResources
                  .filter(r =>
                    r.name.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(resource => (
                    <TableRow key={resource.id}>
                      <TableCell className="font-medium">
                        {resource.name}
                      </TableCell>
                      <TableCell>{resource.type}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{resource.provider}</span>
                          <span className="text-xs text-muted-foreground">
                            ({resource.region})
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(resource.status)}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex gap-2 items-center">
                            <Progress
                              value={resource.utilizationCpu}
                              className="h-1 w-16"
                              indicatorClassName={
                                resource.utilizationCpu >= 85
                                  ? 'bg-destructive'
                                  : resource.utilizationCpu >= 70
                                    ? 'bg-orange-500'
                                    : 'bg-green-500'
                              }
                            />
                            <span className="text-xs">
                              {resource.utilizationCpu}%
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex gap-2 items-center">
                            <Progress
                              value={resource.utilizationMem}
                              className="h-1 w-16"
                              indicatorClassName={
                                resource.utilizationMem >= 85
                                  ? 'bg-destructive'
                                  : resource.utilizationMem >= 70
                                    ? 'bg-orange-500'
                                    : 'bg-green-500'
                              }
                            />
                            <span className="text-xs">
                              {resource.utilizationMem}%
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{resource.size}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Scale</DropdownMenuItem>
                            <DropdownMenuItem>Backup</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
