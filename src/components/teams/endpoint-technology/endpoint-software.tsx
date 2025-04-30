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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  DownloadCloud,
  GitMerge,
  MoreHorizontal,
  Package,
  Settings,
  XCircle,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

// Sample data for software inventory
const softwareInventory = [
  {
    id: 'sw-001',
    name: 'Microsoft Office',
    publisher: 'Microsoft',
    currentVersion: '365 (2304)',
    latestVersion: '365 (2304)',
    status: 'up-to-date',
    category: 'productivity',
    installCount: 421,
    licensedCount: 450,
    licenseType: 'subscription',
    licenseExpiration: new Date('2026-07-15'),
  },
  {
    id: 'sw-002',
    name: 'Adobe Creative Cloud',
    publisher: 'Adobe',
    currentVersion: '2023.4.1',
    latestVersion: '2023.4.2',
    status: 'update-available',
    category: 'design',
    installCount: 86,
    licensedCount: 100,
    licenseType: 'subscription',
    licenseExpiration: new Date('2025-12-31'),
  },
  {
    id: 'sw-003',
    name: 'Visual Studio Code',
    publisher: 'Microsoft',
    currentVersion: '1.87.2',
    latestVersion: '1.87.2',
    status: 'up-to-date',
    category: 'development',
    installCount: 124,
    licensedCount: null, // Free software
    licenseType: 'free',
    licenseExpiration: null,
  },
  {
    id: 'sw-004',
    name: 'Slack',
    publisher: 'Salesforce',
    currentVersion: '4.35.1',
    latestVersion: '4.35.3',
    status: 'update-available',
    category: 'communication',
    installCount: 387,
    licensedCount: 400,
    licenseType: 'subscription',
    licenseExpiration: new Date('2026-03-15'),
  },
  {
    id: 'sw-005',
    name: 'Zoom',
    publisher: 'Zoom Video Communications',
    currentVersion: '5.17.5',
    latestVersion: '5.17.5',
    status: 'up-to-date',
    category: 'communication',
    installCount: 412,
    licensedCount: 450,
    licenseType: 'subscription',
    licenseExpiration: new Date('2026-05-30'),
  },
  {
    id: 'sw-006',
    name: 'Google Chrome',
    publisher: 'Google',
    currentVersion: '123.0.6312.59',
    latestVersion: '123.0.6312.59',
    status: 'up-to-date',
    category: 'browser',
    installCount: 520,
    licensedCount: null, // Free software
    licenseType: 'free',
    licenseExpiration: null,
  },
  {
    id: 'sw-007',
    name: 'AutoCAD',
    publisher: 'Autodesk',
    currentVersion: '2025.1',
    latestVersion: '2025.2',
    status: 'update-available',
    category: 'design',
    installCount: 28,
    licensedCount: 30,
    licenseType: 'subscription',
    licenseExpiration: new Date('2026-02-28'),
  },
];

// Sample data for software by category
const softwareByCategoryData = [
  { name: 'Productivity', value: 524 },
  { name: 'Communication', value: 412 },
  { name: 'Development', value: 145 },
  { name: 'Design', value: 92 },
  { name: 'Browser', value: 587 },
  { name: 'Security', value: 587 },
];

// Sample data for pending updates
const pendingUpdatesData = [
  {
    id: 'update-001',
    software: 'Adobe Creative Cloud',
    fromVersion: '2023.4.1',
    toVersion: '2023.4.2',
    devices: 78,
    releaseDate: new Date('2025-04-10'),
    severity: 'medium',
    type: 'feature-security',
    status: 'approved',
  },
  {
    id: 'update-002',
    software: 'Slack',
    fromVersion: '4.35.1',
    toVersion: '4.35.3',
    devices: 320,
    releaseDate: new Date('2025-04-12'),
    severity: 'low',
    type: 'feature',
    status: 'testing',
  },
  {
    id: 'update-003',
    software: 'AutoCAD',
    fromVersion: '2025.1',
    toVersion: '2025.2',
    devices: 28,
    releaseDate: new Date('2025-04-08'),
    severity: 'high',
    type: 'security',
    status: 'approved',
  },
  {
    id: 'update-004',
    software: 'Windows 11',
    fromVersion: '22H2',
    toVersion: '23H2',
    devices: 103,
    releaseDate: new Date('2025-03-15'),
    severity: 'critical',
    type: 'feature-security',
    status: 'scheduled',
  },
];

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
];

interface EndpointSoftwareProps {
  searchQuery: string;
}

export function EndpointSoftware({ searchQuery }: EndpointSoftwareProps) {
  const { toast } = useToast();
  const [updateFilter, setUpdateFilter] = useState('all');

  // Get software status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'up-to-date':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Up to Date
          </Badge>
        );
      case 'update-available':
        return (
          <Badge className="bg-blue-500">
            <DownloadCloud className="mr-1 h-3 w-3" />
            Update Available
          </Badge>
        );
      case 'unsupported':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Unsupported
          </Badge>
        );
      case 'deprecated':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Deprecated
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get license badge
  const getLicenseBadge = (type: string) => {
    switch (type) {
      case 'subscription':
        return <Badge variant="outline">Subscription</Badge>;
      case 'perpetual':
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-500 border-purple-500"
          >
            Perpetual
          </Badge>
        );
      case 'free':
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500"
          >
            Free
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Get update severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-blue-500">Low</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  // Get update type badge
  const getUpdateTypeBadge = (type: string) => {
    switch (type) {
      case 'security':
        return <Badge className="bg-red-500">Security</Badge>;
      case 'feature':
        return <Badge className="bg-blue-500">Feature</Badge>;
      case 'feature-security':
        return <Badge className="bg-purple-500">Feature & Security</Badge>;
      case 'maintenance':
        return <Badge className="bg-green-500">Maintenance</Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  // Get update status badge
  const getUpdateStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'testing':
        return (
          <Badge className="bg-amber-500">
            <Clock className="mr-1 h-3 w-3" />
            Testing
          </Badge>
        );
      case 'scheduled':
        return (
          <Badge className="bg-blue-500">
            <Clock className="mr-1 h-3 w-3" />
            Scheduled
          </Badge>
        );
      case 'declined':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <XCircle className="mr-1 h-3 w-3" />
            Declined
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Filter software inventory based on search query
  const filteredSoftware = softwareInventory.filter(
    software =>
      software.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      software.publisher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      software.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter updates based on search query and update filter
  const filteredUpdates = pendingUpdatesData.filter(update => {
    const matchesSearch =
      update.software.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.fromVersion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.toVersion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.type.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      updateFilter === 'all' ||
      (updateFilter === 'critical' &&
        (update.severity === 'critical' || update.severity === 'high')) ||
      (updateFilter === 'security' &&
        (update.type === 'security' || update.type === 'feature-security'));

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Applications Installed
              </p>
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">7</span>
                <span className="text-sm text-muted-foreground">unique</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Across 587 endpoints
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Updates Available
              </p>
              <div className="flex items-center gap-2">
                <DownloadCloud className="h-5 w-5 text-amber-500" />
                <span className="text-2xl font-bold">4</span>
                <span className="text-sm text-muted-foreground">pending</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Affecting 529 endpoints
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Update Compliance
              </p>
              <div className="flex items-center gap-2">
                <GitMerge className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">86%</span>
              </div>
              <Progress
                value={86}
                className="h-1.5"
                indicatorClassName="bg-green-500"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                License Utilization
              </p>
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold">92%</span>
              </div>
              <Progress
                value={92}
                className="h-1.5"
                indicatorClassName="bg-purple-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Software Inventory</CardTitle>
              <CardDescription>
                All software installed across endpoints
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button variant="ghost" className="flex items-center">
                          Software
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">
                        <Button variant="ghost" className="flex items-center">
                          Installs
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead className="hidden md:table-cell">
                        License Type
                      </TableHead>
                      <TableHead className="w-10" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSoftware.map(software => (
                      <TableRow key={software.id}>
                        <TableCell className="font-medium">
                          <div className="flex flex-col">
                            <span>{software.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {software.publisher}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{software.currentVersion}</span>
                            {software.currentVersion !==
                              software.latestVersion && (
                              <span className="text-xs text-blue-500">
                                {software.latestVersion} available
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(software.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1">
                              <span>{software.installCount}</span>
                              {software.licensedCount && (
                                <span className="text-xs text-muted-foreground">
                                  / {software.licensedCount}
                                </span>
                              )}
                            </div>
                            {software.licensedCount && (
                              <Progress
                                value={
                                  (software.installCount /
                                    software.licensedCount) *
                                  100
                                }
                                className="h-1 mt-1 w-24"
                                indicatorClassName={
                                  software.installCount /
                                    software.licensedCount >
                                  0.9
                                    ? 'bg-amber-500'
                                    : 'bg-green-500'
                                }
                              />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex flex-col">
                            {getLicenseBadge(software.licenseType)}
                            {software.licenseExpiration && (
                              <span className="text-xs text-muted-foreground mt-1">
                                Expires:{' '}
                                {software.licenseExpiration.toLocaleDateString()}
                              </span>
                            )}
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
                              <DropdownMenuItem>
                                Manage Licenses
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                Update Software
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                View Installations
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
        </div>

        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Software by Category</CardTitle>
              <CardDescription>
                Distribution of application types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={softwareByCategoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={60}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {softwareByCategoryData.map(entry => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={COLORS[softwareByCategoryData.indexOf(entry) % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value, 'Installations']}
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
              <div className="mt-2 space-y-2">
                {softwareByCategoryData.map(category => (
                  <div
                    key={category.name}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: COLORS[softwareByCategoryData.indexOf(category) % COLORS.length],
                        }}
                      />
                      <span>{category.name}</span>
                    </div>
                    <span>{category.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Updates</CardTitle>
            <CardDescription>
              Software updates waiting to be deployed
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select defaultValue={updateFilter} onValueChange={setUpdateFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter updates" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Updates</SelectItem>
                <SelectItem value="critical">Critical & High</SelectItem>
                <SelectItem value="security">Security Related</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() =>
                toast({
                  title: 'Deploying updates',
                  description:
                    'Update deployment initiated for selected endpoints.',
                })
              }
            >
              <DownloadCloud className="mr-2 h-4 w-4" />
              Deploy Updates
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Software</TableHead>
                  <TableHead>From Version</TableHead>
                  <TableHead>To Version</TableHead>
                  <TableHead>Devices</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUpdates.length > 0 ? (
                  filteredUpdates.map(update => (
                    <TableRow key={update.id}>
                      <TableCell className="font-medium">
                        {update.software}
                      </TableCell>
                      <TableCell>{update.fromVersion}</TableCell>
                      <TableCell>{update.toVersion}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span>{update.devices}</span>
                          <span className="text-muted-foreground">/ 587</span>
                        </div>
                      </TableCell>
                      <TableCell>{getSeverityBadge(update.severity)}</TableCell>
                      <TableCell>{getUpdateTypeBadge(update.type)}</TableCell>
                      <TableCell>
                        {getUpdateStatusBadge(update.status)}
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
                            <DropdownMenuItem>Deploy Now</DropdownMenuItem>
                            <DropdownMenuItem>Schedule</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Decline Update</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <CheckCircle className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          No pending updates found
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
