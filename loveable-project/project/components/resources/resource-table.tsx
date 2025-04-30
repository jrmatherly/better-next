"use client"

import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  ArrowUpDown,
  ChevronDown,
  Info,
  Edit,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Resource } from '@/lib/types';

interface ResourceTableProps {
  resources: Resource[];
  onView: (resource: Resource) => void;
  onEdit: (resource: Resource) => void;
  onDelete: (resourceId: string) => void;
}

type SortField = 'name' | 'type' | 'status' | 'allocation' | 'lastUpdated';
type SortDirection = 'asc' | 'desc';

export function ResourceTable({ resources, onView, onEdit, onDelete }: ResourceTableProps) {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);

  // Handle sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Sort resources based on current sort field and direction
  const sortedResources = [...resources].sort((a, b) => {
    const modifier = sortDirection === 'asc' ? 1 : -1;

    switch (sortField) {
      case 'name':
        return a.name.localeCompare(b.name) * modifier;
      case 'type':
        return a.type.localeCompare(b.type) * modifier;
      case 'status':
        return a.status.localeCompare(b.status) * modifier;
      case 'allocation':
        return (a.allocation - b.allocation) * modifier;
      case 'lastUpdated':
        return (a.lastUpdated.getTime() - b.lastUpdated.getTime()) * modifier;
      default:
        return 0;
    }
  });

  // Get status badge based on resource status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            Inactive
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-orange-500 text-white">
            <AlertTriangle className="mr-1 h-3 w-3" />
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
        return (
          <Badge variant="outline">
            <HelpCircle className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  // Get allocation color based on percentage
  const getAllocationColor = (allocation: number) => {
    if (allocation >= 90) return 'bg-destructive';
    if (allocation >= 75) return 'bg-orange-500';
    if (allocation >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Confirm resource deletion
  const confirmDelete = (resource: Resource) => {
    setResourceToDelete(resource);
  };

  // Handle actual deletion after confirmation
  const handleConfirmDelete = () => {
    if (resourceToDelete) {
      onDelete(resourceToDelete.id);
      setResourceToDelete(null);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px] md:w-[300px]">
                <Button variant="ghost" onClick={() => handleSort('name')}>
                  Name
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Button variant="ghost" onClick={() => handleSort('type')}>
                  Type
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">Location</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort('status')}>
                  Status
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Button variant="ghost" onClick={() => handleSort('allocation')}>
                  Allocation
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">
                <Button variant="ghost" onClick={() => handleSort('lastUpdated')}>
                  Last Updated
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedResources.map((resource) => (
              <TableRow key={resource.id} className="cursor-pointer hover:bg-muted/50" onClick={() => onView(resource)}>
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{resource.name}</span>
                    <span className="text-xs text-muted-foreground md:hidden">
                      {resource.type}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">{resource.type}</TableCell>
                <TableCell className="hidden lg:table-cell">{resource.location}</TableCell>
                <TableCell>{getStatusBadge(resource.status)}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {resource.status === 'active' ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={resource.allocation}
                              className="h-2 w-[60px]"
                              indicatorClassName={getAllocationColor(resource.allocation)}
                            />
                            <span className="text-xs">{resource.allocation}%</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Resource utilization: {resource.allocation}%</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground text-xs">
                  {format(resource.lastUpdated, 'MMM d, yyyy')}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onView(resource);
                      }}>
                        <Info className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onEdit(resource);
                      }}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive focus:text-destructive" 
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmDelete(resource);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
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

      {/* Confirmation Dialog for Deletion */}
      <AlertDialog open={!!resourceToDelete} onOpenChange={(open) => !open && setResourceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the resource <strong>{resourceToDelete?.name}</strong>. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}