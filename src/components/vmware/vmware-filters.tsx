'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertTriangle,
  CheckCircle,
  Database,
  LampDesk as Desktop,
  Filter,
  PauseCircle,
  Server,
  Settings,
  StopCircle,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';

interface VmwareFiltersProps {
  statusFilter: string | null;
  typeFilter: string | null;
  onStatusFilterChangeAction: (status: string | null) => void;
  onTypeFilterChangeAction: (type: string | null) => void;
  onClearFiltersAction: () => void;
}

export function VmwareFilters({
  statusFilter,
  typeFilter,
  onStatusFilterChangeAction,
  onTypeFilterChangeAction,
  onClearFiltersAction,
}: VmwareFiltersProps) {
  // Get count of active filters
  const activeFilterCount = [statusFilter !== null, typeFilter !== null].filter(
    Boolean
  ).length;

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'stopped':
        return <StopCircle className="h-4 w-4 text-muted-foreground" />;
      case 'suspended':
        return <PauseCircle className="h-4 w-4 text-amber-500" />;
      case 'maintenance':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return null;
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'server':
        return <Server className="h-4 w-4" />;
      case 'desktop':
        return <Desktop className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Filter VMs</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span>Status</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => onStatusFilterChangeAction(null)}
                  className={!statusFilter ? 'bg-muted' : ''}
                >
                  <span>All Statuses</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {[
                  'running',
                  'stopped',
                  'suspended',
                  'maintenance',
                  'error',
                ].map(status => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onStatusFilterChangeAction(status)}
                    className={statusFilter === status ? 'bg-muted' : ''}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span className="capitalize">{status}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <div className="flex items-center">
                <Server className="mr-2 h-4 w-4" />
                <span>VM Type</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => onTypeFilterChangeAction(null)}
                  className={!typeFilter ? 'bg-muted' : ''}
                >
                  <span>All Types</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {['server', 'desktop', 'database'].map(type => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => onTypeFilterChangeAction(type)}
                    className={typeFilter === type ? 'bg-muted' : ''}
                  >
                    <div className="flex items-center gap-2">
                      {getTypeIcon(type)}
                      <span className="capitalize">{type}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={onClearFiltersAction}
          disabled={activeFilterCount === 0}
        >
          Clear All Filters
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
