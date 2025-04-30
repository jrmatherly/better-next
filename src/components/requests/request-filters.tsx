'use client';

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
import type {
  RequestPriority,
  RequestStatus,
  RequestType,
} from '@/types/services';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  FileWarning,
  Filter,
  HelpCircle,
  KeyRound,
  NetworkIcon,
  Package,
  Server,
  PenTool as Tool,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';

interface RequestFiltersProps {
  statusFilter: RequestStatus | 'all';
  priorityFilter: RequestPriority | 'all';
  typeFilter: RequestType | 'all';
  onStatusFilterChangeAction: (status: RequestStatus | 'all') => void;
  onPriorityFilterChangeAction: (priority: RequestPriority | 'all') => void;
  onTypeFilterChangeAction: (type: RequestType | 'all') => void;
}

export function RequestFilters({
  statusFilter,
  priorityFilter,
  typeFilter,
  onStatusFilterChangeAction,
  onPriorityFilterChangeAction,
  onTypeFilterChangeAction,
}: RequestFiltersProps) {
  // Get status icon based on status
  const getStatusIcon = (status: RequestStatus) => {
    switch (status) {
      case 'draft':
        return <FileText className="h-4 w-4" />;
      case 'submitted':
        return <FileText className="h-4 w-4" />;
      case 'pending_approval':
        return <Clock className="h-4 w-4" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <AlertTriangle className="h-4 w-4" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get priority icon based on priority
  const getPriorityIcon = (priority: RequestPriority) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'low':
        return <AlertTriangle className="h-4 w-4 text-green-500" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  // Get request type icon
  const getTypeIcon = (type: RequestType) => {
    switch (type) {
      case 'resource_provision':
        return <Server className="h-4 w-4" />;
      case 'access_request':
        return <KeyRound className="h-4 w-4" />;
      case 'maintenance':
        return <Tool className="h-4 w-4" />;
      case 'software_installation':
        return <Package className="h-4 w-4" />;
      case 'service_change':
        return <NetworkIcon className="h-4 w-4" />;
      case 'incident_report':
        return <FileWarning className="h-4 w-4" />;
      case 'other':
        return <HelpCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Format type for display
  const formatType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Count active filters
  const activeFilterCount = [
    statusFilter !== 'all',
    priorityFilter !== 'all',
    typeFilter !== 'all',
  ].filter(Boolean).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Filter Requests</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>Status</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => onStatusFilterChangeAction('all')}
                  className={statusFilter === 'all' ? 'bg-muted' : ''}
                >
                  <span>All Statuses</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(
                  [
                    'draft',
                    'submitted',
                    'pending_approval',
                    'approved',
                    'in_progress',
                    'completed',
                    'rejected',
                    'cancelled',
                  ] as RequestStatus[]
                ).map(status => (
                  <DropdownMenuItem
                    key={status}
                    onClick={() => onStatusFilterChangeAction(status)}
                    className={statusFilter === status ? 'bg-muted' : ''}
                  >
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <span>{formatStatus(status)}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <div className="flex items-center">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span>Priority</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => onPriorityFilterChangeAction('all')}
                  className={priorityFilter === 'all' ? 'bg-muted' : ''}
                >
                  <span>All Priorities</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(
                  ['critical', 'high', 'medium', 'low'] as RequestPriority[]
                ).map(priority => (
                  <DropdownMenuItem
                    key={priority}
                    onClick={() => onPriorityFilterChangeAction(priority)}
                    className={priorityFilter === priority ? 'bg-muted' : ''}
                  >
                    <div className="flex items-center gap-2">
                      {getPriorityIcon(priority)}
                      <span className="capitalize">{priority}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                <span>Request Type</span>
              </div>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => onTypeFilterChangeAction('all')}
                  className={typeFilter === 'all' ? 'bg-muted' : ''}
                >
                  <span>All Types</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {(
                  [
                    'resource_provision',
                    'access_request',
                    'maintenance',
                    'software_installation',
                    'service_change',
                    'incident_report',
                    'other',
                  ] as RequestType[]
                ).map(type => (
                  <DropdownMenuItem
                    key={type}
                    onClick={() => onTypeFilterChangeAction(type)}
                    className={typeFilter === type ? 'bg-muted' : ''}
                  >
                    <div className="flex items-center gap-2">
                      {getTypeIcon(type)}
                      <span>{formatType(type)}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            onStatusFilterChangeAction('all');
            onPriorityFilterChangeAction('all');
            onTypeFilterChangeAction('all');
          }}
          disabled={
            statusFilter === 'all' &&
            priorityFilter === 'all' &&
            typeFilter === 'all'
          }
        >
          Clear All Filters
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
