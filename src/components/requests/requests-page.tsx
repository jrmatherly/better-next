'use client';

import { RequestDetails } from '@/components/requests/request-details';
import { RequestFilters } from '@/components/requests/request-filters';
import { RequestStats } from '@/components/requests/request-stats';
import { RequestTable } from '@/components/requests/request-table';
import { RequestWizard } from '@/components/requests/request-wizard';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/providers/auth-provider';
import type {
  RequestPriority,
  RequestStatus,
  RequestType,
  ServiceRequest,
} from '@/types/services';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

// Sample data for service requests
const initialRequests: ServiceRequest[] = [
  {
    id: 'REQ-001',
    title: 'New VM Provisioning for Project Alpha',
    requestType: 'resource_provision',
    description:
      'Need to provision a new virtual machine for the development team working on Project Alpha.',
    priority: 'high',
    status: 'approved',
    requestor: {
      id: 'user-001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      role: 'user',
      emailVerified: false,
      image:
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    assignedTo: {
      id: 'user-002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'user',
      emailVerified: false,
      image:
        'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    createdAt: new Date('2025-03-10T09:00:00'),
    updatedAt: new Date('2025-03-12T14:30:00'),
    dueDate: new Date('2025-03-17T17:00:00'),
    approvals: [
      {
        id: 'approval-001',
        userId: 'user-003',
        userName: 'Mike Wilson',
        role: 'IT Manager',
        status: 'approved',
        comment: 'Approved for Project Alpha requirements',
        timestamp: new Date('2025-03-11T10:15:00'),
      },
    ],
    relatedResources: ['res-001', 'res-004'],
    comments: [
      {
        id: 'comment-001',
        userId: 'user-001',
        userName: 'John Smith',
        content:
          'Could we expedite this request? The project timeline has been moved up.',
        timestamp: new Date('2025-03-10T15:20:00'),
      },
      {
        id: 'comment-002',
        userId: 'user-002',
        userName: 'Sarah Johnson',
        content:
          "I'll prioritize this request. We should be able to provision the VM by tomorrow.",
        timestamp: new Date('2025-03-11T09:45:00'),
      },
    ],
    attachments: [
      {
        id: 'attachment-001',
        fileName: 'project_requirements.pdf',
        fileSize: 1240000,
        fileType: 'application/pdf',
        uploadedBy: 'John Smith',
        uploadedAt: new Date('2025-03-10T09:00:00'),
        url: '#',
      },
    ],
    metadata: {
      vmSpecs: {
        cpu: 8,
        memory: 32,
        storage: 500,
        os: 'Ubuntu 24.04 LTS',
      },
      projectCode: 'ALPHA-2025',
      costCenter: 'ENG-DEV-01',
    },
  },
  {
    id: 'REQ-002',
    title: 'Storage Allocation Increase',
    requestType: 'resource_provision',
    description:
      'Request additional storage space for the Analytics team database servers.',
    priority: 'medium',
    status: 'pending_approval',
    requestor: {
      id: 'user-004',
      name: 'Emily Johnson',
      email: 'emily.johnson@example.com',
      role: 'user',
      emailVerified: false,
      image:
        'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    createdAt: new Date('2025-03-14T11:30:00'),
    updatedAt: new Date('2025-03-14T11:30:00'),
    dueDate: new Date('2025-03-21T17:00:00'),
    approvals: [
      {
        id: 'approval-002',
        userId: 'user-003',
        userName: 'Mike Wilson',
        role: 'IT Manager',
        status: 'pending',
      },
    ],
    comments: [],
    attachments: [],
    metadata: {
      storageIncrease: '2TB',
      currentStorageUsage: '95%',
      justification:
        'Current storage nearing capacity due to expanded data collection',
    },
  },
  {
    id: 'REQ-003',
    title: 'Network Firewall Configuration',
    requestType: 'service_change',
    description:
      'Request to update firewall rules to allow access to new external API endpoints.',
    priority: 'high',
    status: 'in_progress',
    requestor: {
      id: 'user-005',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      role: 'user',
      emailVerified: false,
      image:
        'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    assignedTo: {
      id: 'user-006',
      name: 'Alex Turner',
      email: 'alex.turner@example.com',
      role: 'user',
      emailVerified: false,
      image:
        'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    createdAt: new Date('2025-03-12T13:15:00'),
    updatedAt: new Date('2025-03-15T09:45:00'),
    dueDate: new Date('2025-03-18T17:00:00'),
    approvals: [
      {
        id: 'approval-003',
        userId: 'user-007',
        userName: 'Jessica Lee',
        role: 'Security Manager',
        status: 'approved',
        comment: 'Approved after security review',
        timestamp: new Date('2025-03-14T16:30:00'),
      },
    ],
    relatedResources: ['res-004'],
    comments: [
      {
        id: 'comment-003',
        userId: 'user-006',
        userName: 'Alex Turner',
        content:
          "I've started implementing the firewall changes. Will need to coordinate with the application team for testing.",
        timestamp: new Date('2025-03-15T09:45:00'),
      },
    ],
    attachments: [
      {
        id: 'attachment-002',
        fileName: 'firewall_requirements.docx',
        fileSize: 850000,
        fileType:
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadedBy: 'Michael Brown',
        uploadedAt: new Date('2025-03-12T13:15:00'),
        url: '#',
      },
    ],
    metadata: {
      ipRanges: ['203.0.113.0/24', '198.51.100.0/24'].join(', '),
      ports: ['443', '8080'].join(', '),
      serviceNames: ['ExternalAPI1', 'ExternalAPI2'].join(', '),
    },
  },
  {
    id: 'REQ-004',
    title: 'Development Environment Setup',
    requestType: 'resource_provision',
    description: 'Setup new development environment for the mobile app team.',
    priority: 'medium',
    status: 'completed',
    requestor: {
      id: 'user-008',
      name: 'David Lee',
      email: 'david.lee@example.com',
      role: 'user',
      emailVerified: false,
      image:
        'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    assignedTo: {
      id: 'user-002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      role: 'user',
      emailVerified: false,
      image:
        'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    createdAt: new Date('2025-03-05T10:00:00'),
    updatedAt: new Date('2025-03-09T15:30:00'),
    dueDate: new Date('2025-03-12T17:00:00'),
    completedAt: new Date('2025-03-09T15:30:00'),
    approvals: [
      {
        id: 'approval-004',
        userId: 'user-003',
        userName: 'Mike Wilson',
        role: 'IT Manager',
        status: 'approved',
        comment: 'Approved for mobile team',
        timestamp: new Date('2025-03-06T11:45:00'),
      },
    ],
    relatedResources: ['res-007'],
    comments: [
      {
        id: 'comment-004',
        userId: 'user-002',
        userName: 'Sarah Johnson',
        content:
          'Environment setup completed and credentials sent to the team.',
        timestamp: new Date('2025-03-09T15:30:00'),
      },
      {
        id: 'comment-005',
        userId: 'user-008',
        userName: 'David Lee',
        content: 'Received and confirmed working. Thank you!',
        timestamp: new Date('2025-03-09T16:15:00'),
      },
    ],
    attachments: [],
    metadata: {
      environments: ['Dev', 'Test'].join(', '),
      repositoryAccess: true,
      cicdPipeline: true,
    },
  },
  {
    id: 'REQ-005',
    title: 'Database Performance Troubleshooting',
    requestType: 'incident_report',
    description:
      'Production database experiencing slow query responses. Need urgent investigation.',
    priority: 'critical',
    status: 'in_progress',
    requestor: {
      id: 'user-009',
      name: 'Lisa Chen',
      email: 'lisa.chen@example.com',
      role: 'user',
      emailVerified: false,
      image:
        'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    assignedTo: {
      id: 'user-010',
      name: 'Robert Taylor',
      email: 'robert.taylor@example.com',
      role: 'user',
      emailVerified: false,
      image:
        'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    createdAt: new Date('2025-03-16T08:30:00'),
    updatedAt: new Date('2025-03-16T09:15:00'),
    dueDate: new Date('2025-03-16T17:00:00'),
    approvals: [],
    relatedResources: ['res-002', 'res-008'],
    comments: [
      {
        id: 'comment-006',
        userId: 'user-010',
        userName: 'Robert Taylor',
        content:
          'Initial investigation shows high I/O wait times. Looking into possible index issues.',
        timestamp: new Date('2025-03-16T09:15:00'),
      },
    ],
    attachments: [
      {
        id: 'attachment-003',
        fileName: 'performance_logs.txt',
        fileSize: 2450000,
        fileType: 'text/plain',
        uploadedBy: 'Lisa Chen',
        uploadedAt: new Date('2025-03-16T08:30:00'),
        url: '#',
      },
    ],
    metadata: {
      impactLevel: 'High',
      affectedSystems: ['OrderProcessing', 'CustomerPortal'].join(', '),
      incidentStartTime: '2025-03-16T07:45:00',
    },
  },
  {
    id: 'REQ-006',
    title: 'Software License Request',
    requestType: 'software_installation',
    description:
      'Request for 10 new Adobe Creative Cloud licenses for the Marketing team.',
    priority: 'low',
    status: 'rejected',
    requestor: {
      id: 'user-011',
      name: 'Amanda Wilson',
      email: 'amanda.wilson@example.com',
      role: 'user',
      emailVerified: false,
      image:
        'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    createdAt: new Date('2025-03-08T14:30:00'),
    updatedAt: new Date('2025-03-10T11:00:00'),
    approvals: [
      {
        id: 'approval-005',
        userId: 'user-012',
        userName: 'Thomas Wright',
        role: 'Finance Manager',
        status: 'rejected',
        comment:
          'Budget for this quarter has been allocated. Please resubmit in Q3.',
        timestamp: new Date('2025-03-10T11:00:00'),
      },
    ],
    comments: [],
    attachments: [],
    metadata: {
      softwareName: 'Adobe Creative Cloud',
      licenseType: 'Subscription',
      licenseDuration: '1 year',
      estimatedCost: '$6,000',
    },
  },
  {
    id: 'REQ-007',
    title: 'Server Maintenance Window',
    requestType: 'maintenance',
    description:
      'Schedule maintenance window for production servers to apply security patches.',
    priority: 'medium',
    status: 'approved',
    requestor: {
      id: 'user-013',
      name: 'Brian Harris',
      email: 'brian.harris@example.com',
      role: 'user',
      emailVerified: false,
      image:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    assignedTo: {
      id: 'user-013',
      name: 'Brian Harris',
      email: 'brian.harris@example.com',
      role: 'user',
      emailVerified: false,
      image:
        'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    createdAt: new Date('2025-03-13T16:45:00'),
    updatedAt: new Date('2025-03-15T10:30:00'),
    dueDate: new Date('2025-03-20T02:00:00'),
    approvals: [
      {
        id: 'approval-006',
        userId: 'user-014',
        userName: 'Katherine Martinez',
        role: 'Operations Director',
        status: 'approved',
        comment:
          'Approved for the requested time window. Ensure all stakeholders are notified.',
        timestamp: new Date('2025-03-15T10:30:00'),
      },
    ],
    relatedResources: ['res-001', 'res-003', 'res-004'],
    comments: [
      {
        id: 'comment-007',
        userId: 'user-013',
        userName: 'Brian Harris',
        content: 'All teams have been notified of the maintenance window.',
        timestamp: new Date('2025-03-15T14:20:00'),
      },
    ],
    attachments: [
      {
        id: 'attachment-004',
        fileName: 'maintenance_plan.pdf',
        fileSize: 980000,
        fileType: 'application/pdf',
        uploadedBy: 'Brian Harris',
        uploadedAt: new Date('2025-03-13T16:45:00'),
        url: '#',
      },
    ],
    metadata: {
      maintenanceWindow: '2025-03-20 01:00 - 03:00 UTC',
      estimatedDowntime: '45 minutes',
      affectedServices: ['Web Portal', 'API Gateway', 'Database Cluster'].join(
        ', '
      ),
    },
  },
  {
    id: 'REQ-008',
    title: 'User Access Request',
    requestType: 'access_request',
    description:
      'Request access to AWS production environment for new DevOps engineer.',
    priority: 'medium',
    status: 'submitted',
    requestor: {
      id: 'user-015',
      name: 'Daniel Morgan',
      email: 'daniel.morgan@example.com',
      role: 'user',
      emailVerified: false,
      image:
        'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    },
    createdAt: new Date('2025-03-16T14:00:00'),
    updatedAt: new Date('2025-03-16T14:00:00'),
    dueDate: new Date('2025-03-18T17:00:00'),
    approvals: [
      {
        id: 'approval-007',
        userId: 'user-003',
        userName: 'Mike Wilson',
        role: 'IT Manager',
        status: 'pending',
      },
      {
        id: 'approval-008',
        userId: 'user-016',
        userName: 'James Rodriguez',
        role: 'Security Officer',
        status: 'pending',
      },
    ],
    comments: [],
    attachments: [],
    metadata: {
      userName: 'Nathan Davis',
      userEmail: 'nathan.davis@example.com',
      accessLevel: 'ReadWrite',
      justification:
        'New DevOps engineer requiring access to manage infrastructure',
    },
  },
];

export function RequestsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<ServiceRequest[]>(initialRequests);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | 'all'>(
    'all'
  );
  const [priorityFilter, setPriorityFilter] = useState<RequestPriority | 'all'>(
    'all'
  );
  const [typeFilter, setTypeFilter] = useState<RequestType | 'all'>('all');
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  // Filter requests based on search query and filters
  const filteredRequests = requests.filter(request => {
    // Match search query
    const matchesSearch =
      !searchQuery ||
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.id.toLowerCase().includes(searchQuery.toLowerCase());

    // Match status filter
    const matchesStatus =
      statusFilter === 'all' || request.status === statusFilter;

    // Match priority filter
    const matchesPriority =
      priorityFilter === 'all' || request.priority === priorityFilter;

    // Match type filter
    const matchesType =
      typeFilter === 'all' || request.requestType === typeFilter;

    // Match tab filter
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'pending_approval' &&
        request.status === 'pending_approval') ||
      (activeTab === 'in_progress' && request.status === 'in_progress') ||
      (activeTab === 'my_requests' && request.requestor.id === user?.id) ||
      (activeTab === 'assigned_to_me' && request.assignedTo?.id === user?.id);

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority &&
      matchesType &&
      matchesTab
    );
  });

  // Handle creating a new request
  const handleCreateRequest = (requestData: Partial<ServiceRequest>) => {
    const newRequest: ServiceRequest = {
      id: `REQ-${(requests.length + 1).toString().padStart(3, '0')}`,
      title: requestData.title || '',
      requestType: requestData.requestType || 'other',
      description: requestData.description || '',
      priority: requestData.priority || 'medium',
      status: 'submitted',
      requestor: {
        id: user?.id || '',
        name: user?.name || '',
        email: user?.email || '',
        role: 'user',
        emailVerified: false,
        image: user?.image,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      dueDate: requestData.dueDate,
      approvals: [],
      comments: [],
      attachments: [],
      metadata: requestData.metadata || {},
    };

    setRequests([newRequest, ...requests]);
    setIsCreatingRequest(false);

    toast({
      title: 'Request submitted',
      description: `Request ${newRequest.id} has been submitted successfully.`,
    });
  };

  // Handle updating a request
  const handleUpdateRequest = (updatedRequest: ServiceRequest) => {
    setRequests(
      requests.map(r =>
        r.id === updatedRequest.id
          ? { ...updatedRequest, updatedAt: new Date() }
          : r
      )
    );
    setSelectedRequest(null);

    toast({
      title: 'Request updated',
      description: `Request ${updatedRequest.id} has been updated successfully.`,
    });
  };

  // Handle deleting a request
  const handleDeleteRequest = (requestId: string) => {
    const requestToDelete = requests.find(r => r.id === requestId);
    if (!requestToDelete) return;

    setRequests(requests.filter(r => r.id !== requestId));
    setSelectedRequest(null);

    toast({
      title: 'Request deleted',
      description: `Request ${requestToDelete.id} has been deleted.`,
      variant: 'destructive',
    });
  };

  // Handle viewing a request
  const handleViewRequest = (request: ServiceRequest) => {
    setSelectedRequest(request);
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Refreshed',
        description: 'Service requests have been refreshed.',
      });
    }, 1000);
  };

  // Get request counts for tabs
  const pendingApprovalCount = requests.filter(
    r => r.status === 'pending_approval'
  ).length;
  const inProgressCount = requests.filter(
    r => r.status === 'in_progress'
  ).length;
  const myRequestsCount = requests.filter(
    r => r.requestor.id === user?.id
  ).length;
  const assignedToMeCount = requests.filter(
    r => r.assignedTo?.id === user?.id
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Service Requests
          </h1>
          <p className="text-muted-foreground">
            Submit and manage service requests across the organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreatingRequest(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
          <Button
            variant="outline"
            size="icon"
            title="Refresh Requests"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
          <TabsTrigger value="all">All Requests</TabsTrigger>
          <TabsTrigger value="pending_approval" className="relative">
            Pending Approval
            {pendingApprovalCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {pendingApprovalCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="in_progress" className="relative">
            In Progress
            {inProgressCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {inProgressCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="my_requests" className="relative">
            My Requests
            {myRequestsCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {myRequestsCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="assigned_to_me" className="relative">
            Assigned to Me
            {assignedToMeCount > 0 && (
              <span className="absolute top-0.5 right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                {assignedToMeCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-3 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search requests..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <RequestFilters
                  statusFilter={statusFilter}
                  priorityFilter={priorityFilter}
                  typeFilter={typeFilter}
                  onStatusFilterChangeAction={setStatusFilter}
                  onPriorityFilterChangeAction={setPriorityFilter}
                  onTypeFilterChangeAction={setTypeFilter}
                />
              </div>
            </div>

            <TabsContent value="all" className="m-0">
              {filteredRequests.length > 0 ? (
                <RequestTable
                  requests={filteredRequests}
                  onViewAction={handleViewRequest}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No requests found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    {searchQuery ||
                    statusFilter !== 'all' ||
                    priorityFilter !== 'all' ||
                    typeFilter !== 'all'
                      ? 'No requests match your current filters. Try adjusting your search or filters.'
                      : 'There are no service requests yet. Create your first request to get started.'}
                  </p>
                  {(searchQuery ||
                    statusFilter !== 'all' ||
                    priorityFilter !== 'all' ||
                    typeFilter !== 'all') && (
                    <Button
                      variant="outline"
                      className="mt-4"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setPriorityFilter('all');
                        setTypeFilter('all');
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                  {!searchQuery &&
                    statusFilter === 'all' &&
                    priorityFilter === 'all' &&
                    typeFilter === 'all' && (
                      <Button
                        className="mt-4"
                        onClick={() => setIsCreatingRequest(true)}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        New Request
                      </Button>
                    )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending_approval" className="m-0">
              {filteredRequests.length > 0 ? (
                <RequestTable
                  requests={filteredRequests}
                  onViewAction={handleViewRequest}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No pending approvals</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    There are no requests waiting for approval at this time.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="in_progress" className="m-0">
              {filteredRequests.length > 0 ? (
                <RequestTable
                  requests={filteredRequests}
                  onViewAction={handleViewRequest}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">
                    No requests in progress
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    There are no requests currently in progress.
                  </p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="my_requests" className="m-0">
              {filteredRequests.length > 0 ? (
                <RequestTable
                  requests={filteredRequests}
                  onViewAction={handleViewRequest}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No requests found</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    You haven't submitted any service requests yet.
                  </p>
                  <Button
                    className="mt-4"
                    onClick={() => setIsCreatingRequest(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    New Request
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="assigned_to_me" className="m-0">
              {filteredRequests.length > 0 ? (
                <RequestTable
                  requests={filteredRequests}
                  onViewAction={handleViewRequest}
                />
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No assigned requests</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    You don't have any service requests assigned to you.
                  </p>
                </div>
              )}
            </TabsContent>
          </div>

          <div className="space-y-6">
            <RequestStats requests={requests} />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Service requests due soon</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {requests
                  .filter(
                    r =>
                      r.dueDate &&
                      r.status !== 'completed' &&
                      r.status !== 'cancelled'
                  )
                  .sort((a, b) =>
                    a.dueDate && b.dueDate
                      ? a.dueDate.getTime() - b.dueDate.getTime()
                      : 0
                  )
                  .slice(0, 5)
                  .map(request => (
                    <button
                      key={request.id}
                      className="flex justify-between items-center p-2 rounded-md hover:bg-muted/50 cursor-pointer w-full text-left"
                      onClick={() => handleViewRequest(request)}
                      tabIndex={0}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ')
                          handleViewRequest(request);
                      }}
                      type="button"
                    >
                      <div className="flex flex-col">
                        <span
                          className="text-sm font-medium truncate"
                          title={request.title}
                        >
                          {request.title.length > 30
                            ? `${request.title.substring(0, 30)}...`
                            : request.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {request.id}
                        </span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">
                          {request.dueDate
                            ? format(request.dueDate, 'MMM d')
                            : 'No date'}
                        </span>
                      </div>
                    </button>
                  ))}
                {requests.filter(
                  r =>
                    r.dueDate &&
                    r.status !== 'completed' &&
                    r.status !== 'cancelled'
                ).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-4 text-center">
                    <Clock className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No upcoming deadlines
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>

      {/* Request Wizard for creating new requests */}
      {isCreatingRequest && (
        <RequestWizard
          onSubmitAction={handleCreateRequest}
          onCancelAction={() => setIsCreatingRequest(false)}
        />
      )}

      {/* Request Details */}
      {selectedRequest && (
        <RequestDetails
          request={selectedRequest}
          onCloseAction={() => setSelectedRequest(null)}
          onUpdateAction={handleUpdateRequest}
          onDeleteAction={handleDeleteRequest}
        />
      )}
    </div>
  );
}
