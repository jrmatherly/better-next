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
  Building,
  CheckCircle,
  Clock,
  MapPin,
  MoreHorizontal,
  Signal,
  Truck,
  Users,
  Wifi,
  WifiOff,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

// Sample field locations data
const fieldLocations = [
  {
    id: 'loc-001',
    name: 'Northwest Field Office',
    type: 'Office',
    address: '123 Main St, Seattle, WA 98101',
    status: 'active',
    devices: 24,
    employees: 35,
    connectivityStatus: 'healthy',
    lastChecked: new Date('2025-04-15T12:30:00'),
  },
  {
    id: 'loc-002',
    name: 'Northeast Distribution Center',
    type: 'Warehouse',
    address: '456 Park Ave, New York, NY 10022',
    status: 'active',
    devices: 42,
    employees: 68,
    connectivityStatus: 'healthy',
    lastChecked: new Date('2025-04-15T11:45:00'),
  },
  {
    id: 'loc-003',
    name: 'Southwest Field Office',
    type: 'Office',
    address: '789 Palm Dr, Phoenix, AZ 85001',
    status: 'active',
    devices: 18,
    employees: 22,
    connectivityStatus: 'issues',
    lastChecked: new Date('2025-04-15T10:15:00'),
  },
  {
    id: 'loc-004',
    name: 'Southeast Distribution Center',
    type: 'Warehouse',
    address: '101 Ocean Blvd, Miami, FL 33139',
    status: 'active',
    devices: 36,
    employees: 54,
    connectivityStatus: 'healthy',
    lastChecked: new Date('2025-04-15T09:30:00'),
  },
  {
    id: 'loc-005',
    name: 'Central Field Station',
    type: 'Station',
    address: '202 Highland Rd, Dallas, TX 75201',
    status: 'maintenance',
    devices: 15,
    employees: 12,
    connectivityStatus: 'offline',
    lastChecked: new Date('2025-04-14T16:20:00'),
  },
  {
    id: 'loc-006',
    name: 'West Coast Mobile Unit',
    type: 'Mobile',
    address: 'Variable - Currently in San Francisco, CA',
    status: 'active',
    devices: 8,
    employees: 6,
    connectivityStatus: 'healthy',
    lastChecked: new Date('2025-04-15T14:10:00'),
  },
  {
    id: 'loc-007',
    name: 'Mountain Region Outpost',
    type: 'Outpost',
    address: '303 Pine Trail, Denver, CO 80201',
    status: 'active',
    devices: 12,
    employees: 10,
    connectivityStatus: 'limited',
    lastChecked: new Date('2025-04-15T13:45:00'),
  },
];

interface FieldLocationsProps {
  searchQuery: string;
}

export function FieldLocations({ searchQuery }: FieldLocationsProps) {
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Get location type icon
  const getLocationIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'office':
        return <Building className="h-4 w-4 text-blue-500" />;
      case 'warehouse':
        return <Building className="h-4 w-4 text-green-500" />;
      case 'station':
        return <Signal className="h-4 w-4 text-purple-500" />;
      case 'mobile':
        return <Truck className="h-4 w-4 text-amber-500" />;
      case 'outpost':
        return <MapPin className="h-4 w-4 text-red-500" />;
      default:
        return <Building className="h-4 w-4" />;
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
      case 'maintenance':
        return (
          <Badge className="bg-blue-500">
            <Clock className="mr-1 h-3 w-3" />
            Maintenance
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Inactive
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get connectivity status badge
  const getConnectivityBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-500">
            <Wifi className="mr-1 h-3 w-3" />
            Healthy
          </Badge>
        );
      case 'limited':
        return (
          <Badge className="bg-amber-500">
            <Signal className="mr-1 h-3 w-3" />
            Limited
          </Badge>
        );
      case 'issues':
        return (
          <Badge className="bg-orange-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Issues
          </Badge>
        );
      case 'offline':
        return (
          <Badge variant="destructive">
            <WifiOff className="mr-1 h-3 w-3" />
            Offline
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

  // Filter and sort locations
  const filteredAndSortedLocations = fieldLocations
    .filter(
      location =>
        location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.type.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const modifier = sortOrder === 'asc' ? 1 : -1;

      switch (sortField) {
        case 'name':
          return a.name.localeCompare(b.name) * modifier;
        case 'type':
          return a.type.localeCompare(b.type) * modifier;
        case 'devices':
          return (a.devices - b.devices) * modifier;
        case 'employees':
          return (a.employees - b.employees) * modifier;
        default:
          return 0;
      }
    });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Field Locations</CardTitle>
          <CardDescription>
            Manage and monitor all field locations and their status
          </CardDescription>
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
                      Name
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('type')}
                      className="flex items-center"
                    >
                      Type
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Connectivity</TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('devices')}
                      className="flex items-center"
                    >
                      Devices
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('employees')}
                      className="flex items-center"
                    >
                      Staff
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAndSortedLocations.map(location => (
                  <TableRow key={location.id}>
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>{location.name}</span>
                        <span
                          className="text-xs text-muted-foreground truncate max-w-[200px]"
                          title={location.address}
                        >
                          {location.address}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getLocationIcon(location.type)}
                        <span>{location.type}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(location.status)}</TableCell>
                    <TableCell>
                      {getConnectivityBadge(location.connectivityStatus)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Signal className="h-4 w-4 text-muted-foreground" />
                        <span>{location.devices}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{location.employees}</span>
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
                          <DropdownMenuItem>Edit Location</DropdownMenuItem>
                          <DropdownMenuItem>Manage Devices</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            Connectivity Check
                          </DropdownMenuItem>
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Location Types</CardTitle>
            <CardDescription>
              Distribution of field locations by type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-blue-500" />
                    <span>Offices</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>2</span>
                    <span className="text-muted-foreground">/ 24</span>
                  </div>
                </div>
                <Progress value={(2 / 7) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-green-500" />
                    <span>Warehouses</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>2</span>
                    <span className="text-muted-foreground">/ 24</span>
                  </div>
                </div>
                <Progress value={(2 / 7) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4 text-purple-500" />
                    <span>Stations</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>1</span>
                    <span className="text-muted-foreground">/ 24</span>
                  </div>
                </div>
                <Progress value={(1 / 7) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-amber-500" />
                    <span>Mobile Units</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>1</span>
                    <span className="text-muted-foreground">/ 24</span>
                  </div>
                </div>
                <Progress value={(1 / 7) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-red-500" />
                    <span>Outposts</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>1</span>
                    <span className="text-muted-foreground">/ 24</span>
                  </div>
                </div>
                <Progress value={(1 / 7) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Connectivity Overview</CardTitle>
            <CardDescription>
              Current connection status of all locations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col items-center justify-center p-6 rounded-md border">
                  <div className="space-y-2 text-center">
                    <Wifi className="h-8 w-8 mx-auto text-green-500" />
                    <p className="text-2xl font-bold">5</p>
                    <p className="text-sm text-muted-foreground">
                      Healthy Connections
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-6 rounded-md border">
                  <div className="space-y-2 text-center">
                    <WifiOff className="h-8 w-8 mx-auto text-red-500" />
                    <p className="text-2xl font-bold">2</p>
                    <p className="text-sm text-muted-foreground">
                      Connection Issues
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-4">
                <h3 className="text-sm font-medium">
                  Recent Connectivity Issues
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">
                        Southwest Field Office
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Signal degradation detected
                      </p>
                    </div>
                    <Badge className="bg-orange-500">
                      <AlertTriangle className="mr-1 h-3 w-3" />
                      Issues
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                    <div>
                      <p className="text-sm font-medium">
                        Central Field Station
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Network equipment failure
                      </p>
                    </div>
                    <Badge variant="destructive">
                      <WifiOff className="mr-1 h-3 w-3" />
                      Offline
                    </Badge>
                  </div>
                </div>

                <Button variant="outline" className="w-full mt-2" size="sm">
                  View All Connectivity Issues
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
