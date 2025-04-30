'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { logger } from '@/lib/logger';
import { formatDistanceToNow } from 'date-fns';
import {
  CheckCircle,
  Clock,
  FileText,
  MoreHorizontal,
  Plus,
  Rocket,
  RotateCw,
  Search,
  Terminal,
  XCircle,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

// Sample data for deployments
const deployments = [
  {
    id: 'dep-001',
    name: 'Main API v2.4.1',
    environment: 'production',
    status: 'success',
    deployedAt: new Date('2025-04-15T14:30:00'),
    deployedBy: 'John Smith',
    service: 'api-service',
    commit: 'a7d3fc9',
    duration: '3m 24s',
  },
  {
    id: 'dep-002',
    name: 'User Service v1.6.0',
    environment: 'production',
    status: 'success',
    deployedAt: new Date('2025-04-14T11:15:00'),
    deployedBy: 'Emily Johnson',
    service: 'user-service',
    commit: '8b2e1d5',
    duration: '4m 12s',
  },
  {
    id: 'dep-003',
    name: 'Payment Gateway v3.1.2',
    environment: 'production',
    status: 'failed',
    deployedAt: new Date('2025-04-13T16:45:00'),
    deployedBy: 'Mike Wilson',
    service: 'payment-service',
    commit: 'c4f7a2e',
    duration: '2m 38s',
  },
  {
    id: 'dep-004',
    name: 'Frontend Dashboard v4.2.0',
    environment: 'staging',
    status: 'success',
    deployedAt: new Date('2025-04-15T09:20:00'),
    deployedBy: 'Sarah Johnson',
    service: 'dashboard-ui',
    commit: 'e3b79d1',
    duration: '5m 10s',
  },
  {
    id: 'dep-005',
    name: 'Analytics Service v2.0.0',
    environment: 'staging',
    status: 'running',
    deployedAt: new Date('2025-04-15T15:30:00'),
    deployedBy: 'Brian Harris',
    service: 'analytics-service',
    commit: 'f1e8c7b',
    duration: '2m 15s',
  },
  {
    id: 'dep-006',
    name: 'Notification Service v1.3.5',
    environment: 'development',
    status: 'success',
    deployedAt: new Date('2025-04-14T13:40:00'),
    deployedBy: 'Lisa Chen',
    service: 'notification-service',
    commit: '9a4d2e6',
    duration: '1m 50s',
  },
  {
    id: 'dep-007',
    name: 'Authentication Service v2.2.1',
    environment: 'development',
    status: 'success',
    deployedAt: new Date('2025-04-13T10:10:00'),
    deployedBy: 'Daniel Morgan',
    service: 'auth-service',
    commit: 'b5c3a8f',
    duration: '2m 25s',
  },
];

// Sample data for services
const services = [
  {
    id: 'svc-001',
    name: 'api-service',
    description: 'Main API service for client applications',
    instances: 4,
    status: 'healthy',
    uptime: '99.98%',
    lastDeployed: new Date('2025-04-15T14:30:00'),
  },
  {
    id: 'svc-002',
    name: 'user-service',
    description: 'User management microservice',
    instances: 3,
    status: 'healthy',
    uptime: '99.95%',
    lastDeployed: new Date('2025-04-14T11:15:00'),
  },
  {
    id: 'svc-003',
    name: 'payment-service',
    description: 'Payment processing service',
    instances: 3,
    status: 'degraded',
    uptime: '99.82%',
    lastDeployed: new Date('2025-04-13T16:45:00'),
  },
  {
    id: 'svc-004',
    name: 'dashboard-ui',
    description: 'Frontend dashboard application',
    instances: 2,
    status: 'healthy',
    uptime: '99.99%',
    lastDeployed: new Date('2025-04-15T09:20:00'),
  },
  {
    id: 'svc-005',
    name: 'analytics-service',
    description: 'Data analytics processing service',
    instances: 2,
    status: 'deploying',
    uptime: '99.92%',
    lastDeployed: new Date('2025-04-15T15:30:00'),
  },
  {
    id: 'svc-006',
    name: 'notification-service',
    description: 'User notification delivery service',
    instances: 2,
    status: 'healthy',
    uptime: '99.97%',
    lastDeployed: new Date('2025-04-14T13:40:00'),
  },
  {
    id: 'svc-007',
    name: 'auth-service',
    description: 'Authentication and authorization service',
    instances: 3,
    status: 'healthy',
    uptime: '99.99%',
    lastDeployed: new Date('2025-04-13T10:10:00'),
  },
];

// Sample deployment logs
const deploymentLogs = [
  {
    time: '15:30:10',
    level: 'info',
    message: 'Starting deployment of analytics-service v2.0.0',
  },
  {
    time: '15:30:15',
    level: 'info',
    message: 'Pulling container image analytics-service:v2.0.0',
  },
  {
    time: '15:30:45',
    level: 'info',
    message: 'Image pulled successfully',
  },
  {
    time: '15:30:50',
    level: 'info',
    message: 'Creating deployment resources',
  },
  {
    time: '15:31:15',
    level: 'info',
    message: 'Scaling up new deployment',
  },
  {
    time: '15:31:30',
    level: 'info',
    message: 'Waiting for new pods to be ready',
  },
  {
    time: '15:31:45',
    level: 'warn',
    message: 'Pod analytics-service-67d9f4b8d9-2xvp4 starting slowly',
  },
  {
    time: '15:32:15',
    level: 'info',
    message: 'All pods are ready',
  },
  {
    time: '15:32:20',
    level: 'info',
    message: 'Switching traffic to new deployment',
  },
  {
    time: '15:32:25',
    level: 'info',
    message: 'Deployment completed successfully',
  },
];

export function WorkloadDeployments() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeployment, setSelectedDeployment] = useState<string | null>(
    null
  );
  const [isViewingLogs, setIsViewingLogs] = useState(false);

  // Get status badge based on deployment status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Success
          </Badge>
        );
      case 'running':
        return (
          <Badge className="bg-blue-500">
            <RotateCw className="mr-1 h-3 w-3 animate-spin" />
            Running
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Failed
          </Badge>
        );
      case 'queued':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            <Clock className="mr-1 h-3 w-3" />
            Queued
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get service status badge
  const getServiceStatusBadge = (status: string) => {
    switch (status) {
      case 'healthy':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Healthy
          </Badge>
        );
      case 'degraded':
        return (
          <Badge className="bg-orange-500">
            <Clock className="mr-1 h-3 w-3" />
            Degraded
          </Badge>
        );
      case 'deploying':
        return (
          <Badge className="bg-blue-500">
            <RotateCw className="mr-1 h-3 w-3 animate-spin" />
            Deploying
          </Badge>
        );
      case 'down':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Down
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get log level badge
  const getLogLevelBadge = (level: string) => {
    switch (level) {
      case 'info':
        return <Badge className="bg-blue-500">INFO</Badge>;
      case 'warn':
        return <Badge className="bg-orange-500">WARN</Badge>;
      case 'error':
        return <Badge variant="destructive">ERROR</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  // Filter deployments based on search
  const filteredDeployments = deployments.filter(
    dep =>
      dep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.environment.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.service.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Tabs defaultValue="deployments">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="deployments" className="mt-4 space-y-4">
          <div className="flex justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search deployments..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Deployment
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Deployed By</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeployments.map(deployment => (
                    <TableRow
                      key={deployment.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedDeployment(deployment.id)}
                    >
                      <TableCell className="font-medium">
                        {deployment.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {deployment.environment}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(deployment.status)}</TableCell>
                      <TableCell>{deployment.service}</TableCell>
                      <TableCell>{deployment.deployedBy}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDistanceToNow(deployment.deployedAt, {
                          addSuffix: true,
                        })}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            asChild
                            onClick={e => e.stopPropagation()}
                          >
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                setSelectedDeployment(deployment.id);
                              }}
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={e => {
                                e.stopPropagation();
                                setIsViewingLogs(true);
                              }}
                            >
                              <Terminal className="mr-2 h-4 w-4" />
                              View Logs
                            </DropdownMenuItem>
                            {deployment.status === 'failed' && (
                              <DropdownMenuItem
                                onClick={e => e.stopPropagation()}
                              >
                                <RotateCw className="mr-2 h-4 w-4" />
                                Retry Deployment
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={e => e.stopPropagation()}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Rollback
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="mt-4 space-y-4">
          <div className="flex justify-between">
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search services..."
                className="pl-8"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Service
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Instances</TableHead>
                    <TableHead>Uptime</TableHead>
                    <TableHead>Last Deployed</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services
                    .filter(
                      svc =>
                        svc.name
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase()) ||
                        svc.description
                          .toLowerCase()
                          .includes(searchQuery.toLowerCase())
                    )
                    .map(service => (
                      <TableRow key={service.id} className="cursor-pointer">
                        <TableCell className="font-medium">
                          {service.name}
                        </TableCell>
                        <TableCell
                          className="max-w-[200px] truncate"
                          title={service.description}
                        >
                          {service.description}
                        </TableCell>
                        <TableCell>
                          {getServiceStatusBadge(service.status)}
                        </TableCell>
                        <TableCell>{service.instances}</TableCell>
                        <TableCell>{service.uptime}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDistanceToNow(service.lastDeployed, {
                            addSuffix: true,
                          })}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Rocket className="mr-2 h-4 w-4" />
                                Deploy
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Terminal className="mr-2 h-4 w-4" />
                                View Logs
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <RotateCw className="mr-2 h-4 w-4" />
                                Restart
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Deployment Details Dialog */}
      {selectedDeployment && (
        <Dialog
          open={!!selectedDeployment}
          onOpenChange={open => !open && setSelectedDeployment(null)}
        >
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Deployment Details</DialogTitle>
              <DialogDescription>
                Information about the selected deployment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {(() => {
                const deployment = deployments.find(
                  d => d.id === selectedDeployment
                );
                if (!deployment) return null;

                return (
                  <>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">
                          {deployment.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {deployment.service}
                        </p>
                      </div>
                      {getStatusBadge(deployment.status)}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Environment
                        </p>
                        <p className="text-sm font-medium capitalize">
                          {deployment.environment}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Commit</p>
                        <p className="text-sm font-medium">
                          {deployment.commit}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Deployed By
                        </p>
                        <p className="text-sm font-medium">
                          {deployment.deployedBy}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Duration
                        </p>
                        <p className="text-sm font-medium">
                          {deployment.duration}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Deployed At
                        </p>
                        <p className="text-sm font-medium">
                          {deployment.deployedAt.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Deployment Logs</h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setIsViewingLogs(true)}
                        >
                          <Terminal className="mr-2 h-4 w-4" />
                          View Full Logs
                        </Button>
                      </div>
                      <div className="bg-muted p-3 rounded-md h-48 overflow-y-auto font-mono text-xs">
                        {deploymentLogs.map(log => (
                          <div
                            key={`${log.time}-${log.message.substring(0, 20)}`}
                            className="pb-1"
                          >
                            <span className="text-muted-foreground">
                              [{log.time}]
                            </span>{' '}
                            <span
                              className={
                                log.level === 'error'
                                  ? 'text-red-500'
                                  : log.level === 'warn'
                                    ? 'text-amber-500'
                                    : 'text-foreground'
                              }
                            >
                              {log.message}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setSelectedDeployment(null)}
              >
                Close
              </Button>
              <Button>View Service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Logs Dialog */}
      {isViewingLogs && (
        <Dialog open={isViewingLogs} onOpenChange={setIsViewingLogs}>
          <DialogContent className="sm:max-w-[800px] h-[600px] flex flex-col">
            <DialogHeader>
              <DialogTitle>Deployment Logs</DialogTitle>
              <DialogDescription>
                Full logs for the deployment process
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 overflow-auto bg-muted p-4 rounded-md font-mono text-sm">
              <div className="space-y-1">
                {deploymentLogs.map(log => (
                  <div
                    key={`${log.time}-${log.message.substring(0, 20)}`}
                    className="flex gap-3"
                  >
                    <span className="text-muted-foreground whitespace-nowrap">
                      {log.time}
                    </span>
                    <div className="min-w-[60px]">
                      {getLogLevelBadge(log.level)}
                    </div>
                    <span
                      className={
                        log.level === 'error'
                          ? 'text-red-500'
                          : log.level === 'warn'
                            ? 'text-amber-500'
                            : 'text-foreground'
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button variant="outline" onClick={() => setIsViewingLogs(false)}>
                Close
              </Button>
              <Button
                onClick={() => {
                  // In a real app, this would download the logs
                  logger.info('Downloading logs...');
                }}
              >
                Download Logs
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
