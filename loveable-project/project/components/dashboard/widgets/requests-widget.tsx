"use client"

import React from 'react';
import { format } from 'date-fns';
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Hourglass 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface ServiceRequest {
  id: string;
  title: string;
  requestor: string;
  date: Date;
  status: 'pending' | 'approved' | 'rejected' | 'in-progress';
  priority: 'low' | 'medium' | 'high';
}

const requests: ServiceRequest[] = [
  {
    id: 'REQ-001',
    title: 'VM Provisioning for Project Alpha',
    requestor: 'John Smith',
    date: new Date(2025, 3, 15),
    status: 'approved',
    priority: 'high',
  },
  {
    id: 'REQ-002',
    title: 'Storage Allocation Increase',
    requestor: 'Emily Johnson',
    date: new Date(2025, 3, 16),
    status: 'pending',
    priority: 'medium',
  },
  {
    id: 'REQ-003',
    title: 'Network Access Request',
    requestor: 'Michael Brown',
    date: new Date(2025, 3, 17),
    status: 'in-progress',
    priority: 'medium',
  },
  {
    id: 'REQ-004',
    title: 'Database Server Configuration',
    requestor: 'Sarah Wilson',
    date: new Date(2025, 3, 17),
    status: 'rejected',
    priority: 'high',
  },
  {
    id: 'REQ-005',
    title: 'Development Environment Setup',
    requestor: 'David Lee',
    date: new Date(2025, 3, 18),
    status: 'pending',
    priority: 'low',
  },
];

export function RequestsWidget() {
  const getStatusIcon = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-orange-400" />;
      case 'in-progress':
        return <Hourglass className="h-4 w-4 text-blue-400" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: ServiceRequest['status']) => {
    switch (status) {
      case 'approved':
        return (
          <Badge className="bg-green-500">Approved</Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">Rejected</Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline">Pending</Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-blue-500">In Progress</Badge>
        );
      default:
        return (
          <Badge variant="secondary">Unknown</Badge>
        );
    }
  };

  const getPriorityBadge = (priority: ServiceRequest['priority']) => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="outline" className="border-red-500 text-red-500">High</Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="border-orange-400 text-orange-400">Medium</Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">Low</Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <span className="text-sm text-muted-foreground">Recent Requests</span>
        </div>
        <button className="text-xs text-primary">View All</button>
      </div>
      
      <ScrollArea className="h-[220px]">
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request.id} className="p-3 rounded-md border hover:bg-muted/50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{request.title}</span>
                    {getPriorityBadge(request.priority)}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <span>{request.id}</span>
                    <span className="mx-1">•</span>
                    <span>{request.requestor}</span>
                    <span className="mx-1">•</span>
                    <span>{format(request.date, 'MMM d, yyyy')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-3">
                  {getStatusBadge(request.status)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}