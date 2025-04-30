'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Database,
  Filter,
  HardDrive,
  MonitorPlay,
  MoreVertical,
  Network,
  PlayCircle,
  RefreshCcw,
  Search,
  Settings,
  StopCircle,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Mock data - in a real app, this would come from an API
const resources = [
  {
    id: 'res-001',
    name: 'web-server-01',
    type: 'virtual-machine',
    status: 'ACTIVE',
    owner: 'Alex Kim',
    team: 'Workload Hosting',
    createdAt: '2023-10-15T10:30:00Z',
  },
  {
    id: 'res-002',
    name: 'prod-db-cluster',
    type: 'database',
    status: 'ACTIVE',
    owner: 'Jamie Smith',
    team: 'Workload Hosting',
    createdAt: '2023-09-22T08:15:00Z',
  },
  {
    id: 'res-003',
    name: 'backup-storage',
    type: 'storage',
    status: 'ACTIVE',
    owner: 'Taylor Johnson',
    team: 'Field Technology',
    createdAt: '2023-11-05T14:45:00Z',
  },
  {
    id: 'res-004',
    name: 'dev-network-segment',
    type: 'network',
    status: 'ACTIVE',
    owner: 'Jordan Lee',
    team: 'Endpoint Technology',
    createdAt: '2023-10-30T09:00:00Z',
  },
  {
    id: 'res-005',
    name: 'test-server-01',
    type: 'virtual-machine',
    status: 'STOPPED',
    owner: 'Alex Kim',
    team: 'Workload Hosting',
    createdAt: '2023-11-10T11:20:00Z',
  },
  {
    id: 'res-006',
    name: 'staging-db',
    type: 'database',
    status: 'PROVISIONING',
    owner: 'Jamie Smith',
    team: 'Workload Hosting',
    createdAt: '2023-11-18T13:10:00Z',
  },
];

export function ResourcesList() {
  const [searchQuery, setSearchQuery] = useState('');

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'virtual-machine':
        return <MonitorPlay className="h-4 w-4" />;
      case 'database':
        return <Database className="h-4 w-4" />;
      case 'storage':
        return <HardDrive className="h-4 w-4" />;
      case 'network':
        return <Network className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getResourceTypeLabel = (type: string) => {
    switch (type) {
      case 'virtual-machine':
        return 'Virtual Machine';
      case 'database':
        return 'Database';
      case 'storage':
        return 'Storage';
      case 'network':
        return 'Network';
      default:
        return type;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'STOPPED':
        return <Badge variant="outline">Stopped</Badge>;
      case 'PROVISIONING':
        return <Badge className="bg-blue-500">Provisioning</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

  const filteredResources = resources.filter(
    resource =>
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.team.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.owner.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 w-full max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-8"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No resources found.
                </TableCell>
              </TableRow>
            ) : (
              filteredResources.map(resource => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <Link
                      href={`/resources/${resource.id}`}
                      className="flex items-center space-x-2 hover:underline"
                    >
                      <div className="rounded-full bg-primary/10 p-1">
                        {getResourceIcon(resource.type)}
                      </div>
                      <span>{resource.name}</span>
                    </Link>
                  </TableCell>
                  <TableCell>{getResourceTypeLabel(resource.type)}</TableCell>
                  <TableCell>{getStatusBadge(resource.status)}</TableCell>
                  <TableCell>{resource.owner}</TableCell>
                  <TableCell>{resource.team}</TableCell>
                  <TableCell>{formatDate(resource.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {resource.status === 'STOPPED' ? (
                          <DropdownMenuItem>
                            <PlayCircle className="mr-2 h-4 w-4" />
                            <span>Start</span>
                          </DropdownMenuItem>
                        ) : resource.status === 'ACTIVE' ? (
                          <DropdownMenuItem>
                            <StopCircle className="mr-2 h-4 w-4" />
                            <span>Stop</span>
                          </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem>
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          <span>Restart</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Configure</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
