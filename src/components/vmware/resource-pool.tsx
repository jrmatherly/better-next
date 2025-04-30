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
import { ScrollArea } from '@/components/ui/scroll-area';
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
  CheckCircle,
  CpuIcon,
  Folder,
  FolderPlus,
  MemoryStick as Memory,
  MoreHorizontal,
  Settings,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';

interface ResourcePoolProps {
  detailed?: boolean;
}

// Sample resource pool data
const resourcePools = [
  {
    id: 'rp-1',
    name: 'Production',
    vms: 25,
    status: 'healthy',
    cpuReservation: 60,
    cpuLimit: 128,
    cpuUsage: 75,
    memoryReservation: 128,
    memoryLimit: 384,
    memoryUsage: 82,
    priority: 'high',
    expandable: true,
  },
  {
    id: 'rp-2',
    name: 'Development',
    vms: 12,
    status: 'healthy',
    cpuReservation: 24,
    cpuLimit: 64,
    cpuUsage: 45,
    memoryReservation: 64,
    memoryLimit: 128,
    memoryUsage: 58,
    priority: 'normal',
    expandable: true,
  },
  {
    id: 'rp-3',
    name: 'Testing',
    vms: 8,
    status: 'warning',
    cpuReservation: 16,
    cpuLimit: 32,
    cpuUsage: 88,
    memoryReservation: 32,
    memoryLimit: 96,
    memoryUsage: 92,
    priority: 'normal',
    expandable: true,
  },
  {
    id: 'rp-4',
    name: 'DMZ',
    vms: 5,
    status: 'healthy',
    cpuReservation: 8,
    cpuLimit: 16,
    cpuUsage: 35,
    memoryReservation: 16,
    memoryLimit: 32,
    memoryUsage: 42,
    priority: 'low',
    expandable: false,
  },
];

export function ResourcePool({ detailed = false }: ResourcePoolProps) {
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
            <CheckCircle className="mr-1 h-3 w-3" />
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

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Badge className="bg-blue-500">High</Badge>;
      case 'normal':
        return <Badge variant="outline">Normal</Badge>;
      case 'low':
        return (
          <Badge
            variant="outline"
            className="border-muted-foreground text-muted-foreground"
          >
            Low
          </Badge>
        );
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Resource Pools</CardTitle>
              <CardDescription>VMware resource allocation</CardDescription>
            </div>
            {!detailed && (
              <Button variant="outline" size="sm">
                <FolderPlus className="mr-2 h-4 w-4" />
                New Pool
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {detailed ? (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">VMs</TableHead>
                    <TableHead className="hidden md:table-cell">
                      CPU Usage
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Memory Usage
                    </TableHead>
                    <TableHead className="hidden md:table-cell">
                      Priority
                    </TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resourcePools.map(pool => (
                    <TableRow key={pool.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Folder className="h-4 w-4 text-muted-foreground" />
                          <span>{pool.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(pool.status)}</TableCell>
                      <TableCell className="hidden md:table-cell">
                        {pool.vms}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 w-24">
                          <Progress
                            value={pool.cpuUsage}
                            className="h-2"
                            indicatorClassName={getProgressClass(pool.cpuUsage)}
                          />
                          <span className="text-xs">{pool.cpuUsage}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 w-24">
                          <Progress
                            value={pool.memoryUsage}
                            className="h-2"
                            indicatorClassName={getProgressClass(
                              pool.memoryUsage
                            )}
                          />
                          <span className="text-xs">{pool.memoryUsage}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {getPriorityBadge(pool.priority)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Settings className="mr-2 h-4 w-4" />
                              Edit Pool
                            </DropdownMenuItem>
                            <DropdownMenuItem>Add VM to Pool</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              Delete Pool
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <ScrollArea className="h-[260px] pr-4">
              <div className="space-y-3">
                {resourcePools.map(pool => (
                  <div
                    key={pool.id}
                    className="p-3 border rounded-md space-y-2 hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Folder className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{pool.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(pool.status)}
                        <span className="text-sm text-muted-foreground">
                          {pool.vms} VMs
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1">
                            <CpuIcon className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">CPU</span>
                          </div>
                          <span>{pool.cpuUsage}%</span>
                        </div>
                        <Progress
                          value={pool.cpuUsage}
                          className="h-1"
                          indicatorClassName={getProgressClass(pool.cpuUsage)}
                        />
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-1">
                            <Memory className="h-3 w-3 text-muted-foreground" />
                            <span className="text-muted-foreground">
                              Memory
                            </span>
                          </div>
                          <span>{pool.memoryUsage}%</span>
                        </div>
                        <Progress
                          value={pool.memoryUsage}
                          className="h-1"
                          indicatorClassName={getProgressClass(
                            pool.memoryUsage
                          )}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}

          {detailed && (
            <div className="flex justify-end mt-4">
              <Button>
                <FolderPlus className="mr-2 h-4 w-4" />
                Create Resource Pool
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {detailed && (
        <Card>
          <CardHeader>
            <CardTitle>Resource Allocation Policies</CardTitle>
            <CardDescription>
              Configure how resources are distributed among VMs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <CpuIcon className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">CPU Shares</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Production</span>
                      <Badge>High</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Development</span>
                      <Badge variant="outline">Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Testing</span>
                      <Badge variant="outline">Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">DMZ</span>
                      <Badge
                        variant="outline"
                        className="border-muted-foreground text-muted-foreground"
                      >
                        Low
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Memory className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Memory Shares</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Production</span>
                      <Badge>High</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Development</span>
                      <Badge variant="outline">Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Testing</span>
                      <Badge variant="outline">Normal</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">DMZ</span>
                      <Badge
                        variant="outline"
                        className="border-muted-foreground text-muted-foreground"
                      >
                        Low
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="p-4 border rounded-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">Resource Settings</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      CPU Over-Commitment:{' '}
                      <span className="font-medium">2:1</span>
                    </p>
                    <p>
                      Memory Over-Commitment:{' '}
                      <span className="font-medium">1.5:1</span>
                    </p>
                    <p>
                      DRS Automation:{' '}
                      <span className="font-medium">Fully Automated</span>
                    </p>
                    <p>
                      HA Enabled: <span className="font-medium">Yes</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
