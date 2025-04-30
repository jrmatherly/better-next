'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TooltipProvider } from '@/components/ui/tooltip';
import type { VM } from '@/types/vmware';
import {
  AlertTriangle,
  ArrowUpDown,
  CheckCircle,
  Database,
  LampDesk as Desktop,
  MoreHorizontal,
  PauseCircle,
  Play,
  Power,
  RotateCcw,
  Server,
  Settings,
  StopCircle,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

interface VmListProps {
  vms: VM[];
  onVmSelectAction: (vm: VM) => void;
  onPowerOperationAction: (
    vmId: string,
    operation: 'start' | 'stop' | 'restart'
  ) => void;
}

type SortField = 'name' | 'status' | 'type' | 'cpu' | 'memory' | 'createdAt';
type SortDirection = 'asc' | 'desc';

export function VmList({
  vms,
  onVmSelectAction,
  onPowerOperationAction,
}: VmListProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort VMs based on current sort field and direction
  const sortedVMs = [...vms].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;

    switch (sortField) {
      case 'name':
        return a.name.localeCompare(b.name) * modifier;
      case 'status':
        return a.status.localeCompare(b.status) * modifier;
      case 'type':
        return a.type.localeCompare(b.type) * modifier;
      case 'cpu':
        return (a.cpu - b.cpu) * modifier;
      case 'memory':
        return (a.memory - b.memory) * modifier;
      case 'createdAt':
        return (a.createdAt.getTime() - b.createdAt.getTime()) * modifier;
      default:
        return 0;
    }
  });

  // Get status badge based on VM status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Running
          </Badge>
        );
      case 'stopped':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <StopCircle className="mr-1 h-3 w-3" />
            Stopped
          </Badge>
        );
      case 'suspended':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            <PauseCircle className="mr-1 h-3 w-3" />
            Suspended
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-blue-500">
            <Settings className="mr-1 h-3 w-3" />
            Maintenance
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Get VM type icon
  const getVmTypeIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <Server className="h-4 w-4 text-muted-foreground" />;
      case 'desktop':
        return <Desktop className="h-4 w-4 text-muted-foreground" />;
      case 'database':
        return <Database className="h-4 w-4 text-muted-foreground" />;
      default:
        return <Server className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('name')}>
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('status')}>
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <Button variant="ghost" onClick={() => handleSort('type')}>
                Type
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell">IP Address</TableHead>
            <TableHead className="hidden md:table-cell">
              <Button variant="ghost" onClick={() => handleSort('cpu')}>
                CPU
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <Button variant="ghost" onClick={() => handleSort('memory')}>
                Memory
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell">OS</TableHead>
            <TableHead className="w-[90px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedVMs.length > 0 ? (
            sortedVMs.map(vm => (
              <TableRow
                key={vm.id}
                className="cursor-pointer"
                onClick={() => onVmSelectAction(vm)}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {getVmTypeIcon(vm.type)}
                    <span>{vm.name}</span>
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(vm.status)}</TableCell>
                <TableCell className="hidden md:table-cell capitalize">
                  {vm.type}
                </TableCell>
                <TableCell className="hidden lg:table-cell">{vm.ip}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {vm.cpu} vCPU
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {vm.memory} GB
                </TableCell>
                <TableCell className="hidden lg:table-cell">{vm.os}</TableCell>
                <TableCell>
                  <TooltipProvider>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        asChild
                        onClick={e => e.stopPropagation()}
                      >
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={e => {
                            e.stopPropagation();
                            onVmSelectAction(vm);
                          }}
                        >
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

                        {vm.status === 'stopped' && (
                          <DropdownMenuItem
                            onClick={e => {
                              e.stopPropagation();
                              onPowerOperationAction(vm.id, 'start');
                            }}
                          >
                            <Play className="mr-2 h-4 w-4 text-green-500" />
                            Power On
                          </DropdownMenuItem>
                        )}

                        {vm.status === 'running' && (
                          <>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                onPowerOperationAction(vm.id, 'stop');
                              }}
                            >
                              <Power className="mr-2 h-4 w-4 text-red-500" />
                              Power Off
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                onPowerOperationAction(vm.id, 'restart');
                              }}
                            >
                              <RotateCcw className="mr-2 h-4 w-4 text-amber-500" />
                              Restart
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipProvider>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="h-24 text-center">
                No virtual machines found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
