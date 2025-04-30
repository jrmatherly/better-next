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
import {
  AlertTriangle,
  ArrowUpDown,
  BatteryFull,
  BatteryLow,
  CheckCircle,
  Laptop,
  MoreHorizontal,
  Signal,
  Smartphone,
  Tablet,
  WifiOff,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';

// Sample data for field devices
const fieldDevices = [
  {
    id: 'dev-001',
    name: 'Field Tablet A1',
    type: 'tablet',
    model: 'Samsung Galaxy Tab S9',
    status: 'active',
    batteryLevel: 87,
    connectivityStatus: 'connected',
    location: 'Northwest Field Office',
    assignedTo: 'John Smith',
    lastActive: new Date('2025-04-15T14:30:00'),
    os: 'Android 15',
    osStatus: 'up-to-date',
  },
  {
    id: 'dev-002',
    name: 'Field Phone B2',
    type: 'smartphone',
    model: 'iPhone 16 Pro',
    status: 'active',
    batteryLevel: 42,
    connectivityStatus: 'connected',
    location: 'Northeast Distribution Center',
    assignedTo: 'Emily Johnson',
    lastActive: new Date('2025-04-15T15:10:00'),
    os: 'iOS 18.2',
    osStatus: 'up-to-date',
  },
  {
    id: 'dev-003',
    name: 'Rugged Laptop C3',
    type: 'laptop',
    model: 'Dell Latitude Rugged 5430',
    status: 'active',
    batteryLevel: 65,
    connectivityStatus: 'connected',
    location: 'Southwest Field Office',
    assignedTo: 'Mike Wilson',
    lastActive: new Date('2025-04-15T13:45:00'),
    os: 'Windows 11 Pro',
    osStatus: 'update-required',
  },
  {
    id: 'dev-004',
    name: 'Field Tablet A4',
    type: 'tablet',
    model: 'Apple iPad Pro 13',
    status: 'active',
    batteryLevel: 23,
    connectivityStatus: 'connected',
    location: 'Southeast Distribution Center',
    assignedTo: 'Sarah Johnson',
    lastActive: new Date('2025-04-15T12:30:00'),
    os: 'iPadOS 18.2',
    osStatus: 'up-to-date',
  },
  {
    id: 'dev-005',
    name: 'Field Phone B5',
    type: 'smartphone',
    model: 'Google Pixel 9 Pro',
    status: 'inactive',
    batteryLevel: 0,
    connectivityStatus: 'disconnected',
    location: 'Central Field Station',
    assignedTo: 'Robert Taylor',
    lastActive: new Date('2025-04-12T09:15:00'),
    os: 'Android 15',
    osStatus: 'up-to-date',
  },
  {
    id: 'dev-006',
    name: 'Rugged Tablet A6',
    type: 'tablet',
    model: 'Panasonic Toughpad FZ-G2',
    status: 'active',
    batteryLevel: 78,
    connectivityStatus: 'limited',
    location: 'West Coast Mobile Unit',
    assignedTo: 'Lisa Chen',
    lastActive: new Date('2025-04-15T11:20:00'),
    os: 'Windows 11 Pro',
    osStatus: 'up-to-date',
  },
  {
    id: 'dev-007',
    name: 'Field Laptop C7',
    type: 'laptop',
    model: 'Lenovo ThinkPad X1 Carbon',
    status: 'active',
    batteryLevel: 54,
    connectivityStatus: 'connected',
    location: 'Mountain Region Outpost',
    assignedTo: 'Daniel Morgan',
    lastActive: new Date('2025-04-15T10:45:00'),
    os: 'Windows 11 Pro',
    osStatus: 'up-to-date',
  },
];

// Sample device type stats
const deviceTypeStats = [
  { type: 'tablet', count: 3, activeCount: 3 },
  { type: 'smartphone', count: 2, activeCount: 1 },
  { type: 'laptop', count: 2, activeCount: 2 },
];

// Sample OS stats
const osStats = [
  { os: 'Android 15', count: 2 },
  { os: 'iOS 18.2', count: 1 },
  { os: 'Windows 11 Pro', count: 3 },
  { os: 'iPadOS 18.2', count: 1 },
];

interface FieldDevicesProps {
  searchQuery: string;
}

export function FieldDevices({ searchQuery }: FieldDevicesProps) {
  // Get device icon based on type
  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'tablet':
        return <Tablet className="h-4 w-4 text-purple-500" />;
      case 'smartphone':
        return <Smartphone className="h-4 w-4 text-blue-500" />;
      case 'laptop':
        return <Laptop className="h-4 w-4 text-green-500" />;
      default:
        return <Smartphone className="h-4 w-4" />;
    }
  };

  // Get battery icon based on level
  const getBatteryIcon = (level: number) => {
    if (level === 0)
      return <BatteryLow className="h-4 w-4 text-muted-foreground" />;
    if (level < 20) return <BatteryLow className="h-4 w-4 text-red-500" />;
    if (level < 50) return <BatteryLow className="h-4 w-4 text-amber-500" />;
    return <BatteryFull className="h-4 w-4 text-green-500" />;
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
            <AlertTriangle className="mr-1 h-3 w-3" />
            Inactive
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-blue-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Maintenance
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get connectivity badge
  const getConnectivityBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-500">
            <Signal className="mr-1 h-3 w-3" />
            Connected
          </Badge>
        );
      case 'limited':
        return (
          <Badge className="bg-amber-500">
            <Signal className="mr-1 h-3 w-3" />
            Limited
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="destructive">
            <WifiOff className="mr-1 h-3 w-3" />
            Disconnected
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get OS status badge
  const getOsStatusBadge = (status: string) => {
    switch (status) {
      case 'up-to-date':
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500"
          >
            <CheckCircle className="mr-1 h-3 w-3" />
            Up to date
          </Badge>
        );
      case 'update-required':
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-500 border-amber-500"
          >
            <AlertTriangle className="mr-1 h-3 w-3" />
            Update Required
          </Badge>
        );
      default:
        return null;
    }
  };

  // Filter devices based on search query
  const filteredDevices = fieldDevices.filter(
    device =>
      device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      device.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Device Types</CardTitle>
            <CardDescription>Distribution by device category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceTypeStats.map(stat => (
                <div key={stat.type} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {stat.type === 'tablet' && (
                        <Tablet className="h-4 w-4 text-purple-500" />
                      )}
                      {stat.type === 'smartphone' && (
                        <Smartphone className="h-4 w-4 text-blue-500" />
                      )}
                      {stat.type === 'laptop' && (
                        <Laptop className="h-4 w-4 text-green-500" />
                      )}
                      <span className="capitalize">{stat.type}s</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>{stat.activeCount}</span>
                      <span className="text-muted-foreground">
                        / {stat.count}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={(stat.activeCount / stat.count) * 100}
                    className="h-2"
                    indicatorClassName={
                      stat.type === 'tablet'
                        ? 'bg-purple-500'
                        : stat.type === 'smartphone'
                          ? 'bg-blue-500'
                          : 'bg-green-500'
                    }
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Total Devices
                </span>
                <span className="text-sm font-medium">
                  {fieldDevices.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Operating Systems</CardTitle>
            <CardDescription>Devices by operating system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {osStats.map(stat => (
                <div key={stat.os} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{stat.os}</span>
                    <div className="flex items-center gap-1">
                      <span>{stat.count}</span>
                      <span className="text-muted-foreground">
                        / {fieldDevices.length}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={(stat.count / fieldDevices.length) * 100}
                    className="h-2"
                    indicatorClassName={
                      stat.os.includes('Android')
                        ? 'bg-green-500'
                        : stat.os.includes('iOS') || stat.os.includes('iPadOS')
                          ? 'bg-blue-500'
                          : stat.os.includes('Windows')
                            ? 'bg-purple-500'
                            : 'bg-amber-500'
                    }
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Device Health</CardTitle>
            <CardDescription>Status of field devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center space-y-2 p-4 rounded-md border">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <p className="text-2xl font-bold">
                  {fieldDevices.filter(d => d.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active Devices</p>
              </div>

              <div className="flex flex-col items-center space-y-2 p-4 rounded-md border">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <p className="text-2xl font-bold">
                  {fieldDevices.filter(d => d.status !== 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">
                  Inactive Devices
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t space-y-4">
              <h3 className="text-sm font-medium">Battery Status</h3>
              <div className="flex justify-between gap-2">
                <div className="flex flex-col items-center">
                  <BatteryLow className="h-5 w-5 text-red-500 mb-1" />
                  <p className="text-sm font-medium">
                    {fieldDevices.filter(d => d.batteryLevel < 20).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Critical</p>
                </div>

                <div className="flex flex-col items-center">
                  <BatteryLow className="h-5 w-5 text-amber-500 mb-1" />
                  <p className="text-sm font-medium">
                    {
                      fieldDevices.filter(
                        d => d.batteryLevel >= 20 && d.batteryLevel < 50
                      ).length
                    }
                  </p>
                  <p className="text-xs text-muted-foreground">Low</p>
                </div>

                <div className="flex flex-col items-center">
                  <BatteryFull className="h-5 w-5 text-green-500 mb-1" />
                  <p className="text-sm font-medium">
                    {fieldDevices.filter(d => d.batteryLevel >= 50).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Good</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Field Devices</CardTitle>
          <CardDescription>
            All mobile and field devices in the organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" className="flex items-center">
                      Device
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connectivity</TableHead>
                  <TableHead>Battery</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>OS</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDevices.map(device => (
                  <TableRow key={device.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(device.type)}
                        <div>
                          <p>{device.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {device.model}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{device.location}</TableCell>
                    <TableCell>{getStatusBadge(device.status)}</TableCell>
                    <TableCell>
                      {getConnectivityBadge(device.connectivityStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex gap-2 items-center">
                          {getBatteryIcon(device.batteryLevel)}
                          <span className="text-xs">
                            {device.batteryLevel}%
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{device.assignedTo}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="text-xs">{device.os}</span>
                        {getOsStatusBadge(device.osStatus)}
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
                          <DropdownMenuItem>Track Location</DropdownMenuItem>
                          <DropdownMenuItem>Send Message</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Update Software</DropdownMenuItem>
                          <DropdownMenuItem>Remote Wipe</DropdownMenuItem>
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
