'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Ellipsis,
  ServerCrash,
} from 'lucide-react';

// Mock data - in a real app, this would come from an API
const activeRequests = [
  {
    id: 'REQ-2023-001',
    type: 'VM Creation',
    status: 'pending',
    requestedBy: 'Alex Kim',
    requestedAt: '2023-11-10T14:23:00Z',
  },
  {
    id: 'REQ-2023-002',
    type: 'Access Request',
    status: 'approved',
    requestedBy: 'Jamie Smith',
    requestedAt: '2023-11-12T09:15:00Z',
  },
  {
    id: 'REQ-2023-003',
    type: 'Database Provision',
    status: 'in-progress',
    requestedBy: 'Taylor Johnson',
    requestedAt: '2023-11-14T11:05:00Z',
  },
  {
    id: 'REQ-2023-004',
    type: 'VM Scaling',
    status: 'failed',
    requestedBy: 'Jordan Lee',
    requestedAt: '2023-11-15T16:30:00Z',
  },
];

export function ActiveRequestsWidget() {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="text-green-500 border-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge variant="outline" className="text-blue-500 border-blue-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            In Progress
          </Badge>
        );
      case 'failed':
        return (
          <Badge
            variant="outline"
            className="text-destructive border-destructive"
          >
            <ServerCrash className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Active Requests</CardTitle>
      </CardHeader>
      <CardContent className="px-2">
        <div className="space-y-2">
          {activeRequests.map(request => (
            <div
              key={request.id}
              className="flex items-center justify-between p-2 rounded-md hover:bg-accent cursor-pointer transition-colors"
            >
              <div className="flex flex-col">
                <div className="flex items-center">
                  <span className="font-medium text-sm">{request.type}</span>
                  <span className="text-xs text-muted-foreground ml-2">
                    {request.id}
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground">
                    {request.requestedBy} • {formatDate(request.requestedAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusBadge(request.status)}
                <button
                  type="button"
                  className="h-8 w-8 rounded-md hover:bg-muted flex items-center justify-center"
                >
                  <Ellipsis className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
