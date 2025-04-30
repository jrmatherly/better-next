'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getInitials } from '@/lib/utils';
import type {
  RequestPriority,
  RequestStatus,
  ServiceRequest,
} from '@/types/services';
import { format } from 'date-fns';
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  CheckCircle,
  FileCheck,
  FileClock,
  FilePlus,
  Timer,
  XCircle,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

interface RequestTableProps {
  requests: ServiceRequest[];
  onViewAction: (request: ServiceRequest) => void;
}

type SortField =
  | 'id'
  | 'title'
  | 'status'
  | 'priority'
  | 'createdAt'
  | 'dueDate';
type SortDirection = 'asc' | 'desc';

export function RequestTable({ requests, onViewAction }: RequestTableProps) {
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Sort requests based on current sort field and direction
  const sortedRequests = [...requests].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;

    switch (sortField) {
      case 'id': {
        const idA = a.id;
        const idB = b.id;
        return idA.localeCompare(idB) * modifier;
      }
      case 'title': {
        const titleA = a.title;
        const titleB = b.title;
        return titleA.localeCompare(titleB) * modifier;
      }
      case 'status': {
        const statusA = a.status;
        const statusB = b.status;
        return statusA.localeCompare(statusB) * modifier;
      }
      case 'priority': {
        const priorityOrder = { critical: 3, high: 2, medium: 1, low: 0 };
        const priorityA = priorityOrder[a.priority];
        const priorityB = priorityOrder[b.priority];
        return (priorityA - priorityB) * modifier;
      }
      case 'createdAt': {
        const createdAtA = a.createdAt.getTime();
        const createdAtB = b.createdAt.getTime();
        return (createdAtA - createdAtB) * modifier;
      }
      case 'dueDate': {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        const dueDateA = a.dueDate.getTime();
        const dueDateB = b.dueDate.getTime();
        return (dueDateA - dueDateB) * modifier;
      }
      default:
        return 0;
    }
  });

  // Get status badge based on request status
  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'draft': {
        const badge = (
          <Badge variant="outline" className="text-muted-foreground">
            <FilePlus className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        );
        return badge;
      }
      case 'submitted': {
        const badge = (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            <FilePlus className="mr-1 h-3 w-3" />
            Submitted
          </Badge>
        );
        return badge;
      }
      case 'pending_approval': {
        const badge = (
          <Badge className="bg-amber-500 text-white">
            <FileClock className="mr-1 h-3 w-3" />
            Pending Approval
          </Badge>
        );
        return badge;
      }
      case 'approved': {
        const badge = (
          <Badge className="bg-blue-500 text-white">
            <FileCheck className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
        return badge;
      }
      case 'in_progress': {
        const badge = (
          <Badge className="bg-indigo-500 text-white">
            <Timer className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
        return badge;
      }
      case 'completed': {
        const badge = (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
        return badge;
      }
      case 'rejected': {
        const badge = (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
        return badge;
      }
      case 'cancelled': {
        const badge = (
          <Badge
            variant="outline"
            className="border-destructive text-destructive"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
        return badge;
      }
      default: {
        const badge = <Badge variant="outline">{status}</Badge>;
        return badge;
      }
    }
  };

  // Get priority badge based on request priority
  const getPriorityBadge = (priority: RequestPriority) => {
    switch (priority) {
      case 'critical': {
        const badge = (
          <Badge
            variant="outline"
            className="border-destructive text-destructive"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            Critical
          </Badge>
        );
        return badge;
      }
      case 'high': {
        const badge = (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-500"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            High
          </Badge>
        );
        return badge;
      }
      case 'medium': {
        const badge = (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Medium
          </Badge>
        );
        return badge;
      }
      case 'low': {
        const badge = (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Low
          </Badge>
        );
        return badge;
      }
      default:
        return null;
    }
  };

  // Format request type for display
  const formatRequestType = (type: string) => {
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[90px]">
              <Button variant="ghost" onClick={() => handleSort('id')}>
                ID
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('title')}>
                Title
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <Button variant="ghost" onClick={() => handleSort('status')}>
                Status
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              <Button variant="ghost" onClick={() => handleSort('priority')}>
                Priority
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">Requestor</TableHead>
            <TableHead className="hidden xl:table-cell">Type</TableHead>
            <TableHead className="hidden lg:table-cell">
              <Button variant="ghost" onClick={() => handleSort('createdAt')}>
                Created
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden xl:table-cell">
              <Button variant="ghost" onClick={() => handleSort('dueDate')}>
                Due Date
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedRequests.map(request => (
            <TableRow
              key={request.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onViewAction(request)}
            >
              <TableCell className="font-mono text-xs">{request.id}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{request.title}</span>
                  <span className="text-xs text-muted-foreground md:hidden">
                    {getStatusBadge(request.status)}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {getStatusBadge(request.status)}
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {getPriorityBadge(request.priority)}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={request.requestor.image || undefined}
                      alt={request.requestor.name || ''}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(request.requestor.name || '')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{request.requestor.name}</span>
                </div>
              </TableCell>
              <TableCell className="hidden xl:table-cell text-sm">
                {formatRequestType(request.requestType)}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                {format(request.createdAt, 'MMM d, yyyy')}
              </TableCell>
              <TableCell className="hidden xl:table-cell text-xs">
                {request.dueDate ? (
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="mr-1 h-3.5 w-3.5" />
                    {format(request.dueDate, 'MMM d, yyyy')}
                  </div>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
