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
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle,
  Clock,
  LampDesk as Desktop,
  Laptop,
  Monitor,
  MoreHorizontal,
  Plus,
  Printer,
  Server,
  Smartphone,
  Tablet,
  XCircle,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Sample data for endpoint devices
const endpoints = [
  {
    id: 'ep-001',
    name: 'DESKTOP-MKT-01',
    type: 'desktop',
    model: 'Dell OptiPlex 7090',
    os: 'Windows 11 Pro',
    osVersion: '22H2',
    status: 'active',
    lastSeen: new Date('2025-04-15T15:30:00'),
    department: 'Marketing',
    user: 'John Smith',
    location: 'HQ - 4th Floor',
    memoryUsage: 65,
    diskUsage: 78,
    cpuUsage: 25,
  },
  {
    id: 'ep-002',
    name: 'LAPTOP-DEV-05',
    type: 'laptop',
    model: 'MacBook Pro 16"',
    os: 'macOS',
    osVersion: '15.3',
    status: 'active',
    lastSeen: new Date('2025-04-15T15:45:00'),
    department: 'Development',
    user: 'Emily Johnson',
    location: 'HQ - 3rd Floor',
    memoryUsage: 82,
    diskUsage: 45,
    cpuUsage: 38,
  },
  {
    id: 'ep-003',
    name: 'TABLET-SALES-12',
    type: 'tablet',
    model: 'iPad Pro 12.9"',
    os: 'iPadOS',
    osVersion: '17.4',
    status: 'active',
    lastSeen: new Date('2025-04-15T14:20:00'),
    department: 'Sales',
    user: 'Mike Wilson',
    location: 'Remote',
    memoryUsage: 45,
    diskUsage: 62,
    cpuUsage: 15,
  },
  {
    id: 'ep-004',
    name: 'DESKTOP-FIN-03',
    type: 'desktop',
    model: 'HP EliteDesk 800 G6',
    os: 'Windows 11 Pro',
    osVersion: '22H2',
    status: 'maintenance',
    lastSeen: new Date('2025-04-14T16:45:00'),
    department: 'Finance',
    user: 'Sarah Johnson',
    location: 'HQ - 2nd Floor',
    memoryUsage: 55,
    diskUsage: 88,
    cpuUsage: 5,
  },
  {
    id: 'ep-005',
    name: 'LAPTOP-HR-02',
    type: 'laptop',
    model: 'Lenovo ThinkPad X1 Carbon',
    os: 'Windows 11 Pro',
    osVersion: '22H2',
    status: 'inactive',
    lastSeen: new Date('2025-04-10T11:30:00'),
    department: 'HR',
    user: 'David Lee',
    location: 'Branch - New York',
    memoryUsage: 0,
    diskUsage: 72,
    cpuUsage: 0,
  },
  {
    id: 'ep-006',
    name: 'PRINTER-ADMIN-01',
    type: 'printer',
    model: 'HP LaserJet Enterprise M555',
    os: 'HP FutureSmart',
    osVersion: '4.11.0.1',
    status: 'active',
    lastSeen: new Date('2025-04-15T13:15:00'),
    department: 'Admin',
    user: 'Shared Device',
    location: 'HQ - 1st Floor',
    memoryUsage: 25,
    diskUsage: 15,
    cpuUsage: 5,
  },
  {
    id: 'ep-007',
    name: 'SMARTPHONE-EXEC-01',
    type: 'smartphone',
    model: 'iPhone 16 Pro',
    os: 'iOS',
    osVersion: '18.2',
    status: 'active',
    lastSeen: new Date('2025-04-15T15:10:00'),
    department: 'Executive',
    user: 'Robert Taylor',
    location: 'Remote',
    memoryUsage: 58,
    diskUsage: 65,
    cpuUsage: 12,
  },
];

// Device type distribution data
const deviceTypeData = [
  { name: 'Desktops', value: 125 },
  { name: 'Laptops', value: 235 },
  { name: 'Tablets', value: 87 },
  { name: 'Smartphones', value: 95 },
  { name: 'Printers', value: 45 },
];

// OS distribution data
const osDistributionData = [
  { name: 'Windows', value: 310 },
  { name: 'macOS', value: 95 },
  { name: 'iOS/iPadOS', value: 120 },
  { name: 'Android', value: 62 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface EndpointInventoryProps {
  searchQuery: string;
}

export function EndpointInventory({ searchQuery }: EndpointInventoryProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Get device type icon
  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'desktop':
        return <Desktop className="h-4 w-4 text-blue-500" />;
      case 'laptop':
        return <Laptop className="h-4 w-4 text-green-500" />;
      case 'tablet':
        return <Tablet className="h-4 w-4 text-purple-500" />;
      case 'smartphone':
        return <Smartphone className="h-4 w-4 text-red-500" />;
      case 'printer':
        return <Printer className="h-4 w-4 text-amber-500" />;
      case 'server':
        return <Server className="h-4 w-4 text-teal-500" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <XCircle className="mr-1 h-3 w-3" />
            Inactive
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-blue-500">
            <Clock className="mr-1 h-3 w-3" />
            Maintenance
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-amber-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Warning
          </Badge>
        );
      default:
        return null;
    }
  };

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter and sort endpoints
  const filteredAndSortedEndpoints = endpoints
    .filter(
      endpoint =>
        endpoint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.os.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        endpoint.location.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'name':
          return a.name.localeCompare(b.name) * modifier;
        case 'type':
          return a.type.localeCompare(b.type) * modifier;
        case 'os':
          return a.os.localeCompare(b.os) * modifier;
        case 'department':
          return a.department.localeCompare(b.department) * modifier;
        case 'user':
          return a.user.localeCompare(b.user) * modifier;
        case 'lastSeen':
          return (a.lastSeen.getTime() - b.lastSeen.getTime()) * modifier;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Device Types</CardTitle>
            <CardDescription>
              Distribution of endpoint devices by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={deviceTypeData}
                  margin={{ top: 10, right: 10, left: 20, bottom: 20 }}
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
                    dataKey="value"
                    name="Devices"
                    fill="hsl(var(--chart-1))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 pt-2 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Devices
                </span>
                <span className="text-sm font-medium">587</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Operating Systems</CardTitle>
            <CardDescription>Distribution by operating system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={osDistributionData}
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
                    {osDistributionData.map(entry => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={
                          COLORS[
                            osDistributionData.indexOf(entry) % COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, 'Devices']}
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

            <div className="mt-2 grid grid-cols-2 gap-2">
              {osDistributionData.map(os => (
                <div key={os.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[osDistributionData.indexOf(os) % COLORS.length],
                    }}
                  />
                  <span className="text-sm">
                    {os.name}: {os.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Endpoint Inventory</CardTitle>
            <CardDescription>
              All registered endpoint devices in the organization
            </CardDescription>
          </div>
          <Button
            onClick={() =>
              toast({
                title: 'Adding new endpoint',
                description: 'This feature is coming soon.',
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Endpoint
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('name')}
                      className="flex items-center"
                    >
                      Device
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('os')}
                      className="flex items-center"
                    >
                      OS
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('user')}
                      className="flex items-center"
                    >
                      User
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('department')}
                      className="flex items-center"
                    >
                      Department
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Resources</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('lastSeen')}
                      className="flex items-center"
                    >
                      Last Seen
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedEndpoints.map(endpoint => (
                  <TableRow key={endpoint.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(endpoint.type)}
                        <div>
                          <p>{endpoint.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {endpoint.model}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{endpoint.os}</span>
                        <span className="text-xs text-muted-foreground">
                          {endpoint.osVersion}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(endpoint.status)}</TableCell>
                    <TableCell>{endpoint.user}</TableCell>
                    <TableCell>{endpoint.department}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-muted-foreground">Memory</span>
                          <span>{endpoint.memoryUsage}%</span>
                        </div>
                        <Progress
                          value={endpoint.memoryUsage}
                          className="h-1"
                          indicatorClassName={
                            endpoint.memoryUsage >= 90
                              ? 'bg-destructive'
                              : endpoint.memoryUsage >= 75
                                ? 'bg-orange-500'
                                : endpoint.memoryUsage >= 50
                                  ? 'bg-amber-500'
                                  : 'bg-green-500'
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {endpoint.lastSeen.toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {endpoint.lastSeen.toLocaleTimeString()}
                        </div>
                      </div>
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
                          <DropdownMenuItem>Remote Access</DropdownMenuItem>
                          <DropdownMenuItem>Update Software</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Run Security Scan</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
