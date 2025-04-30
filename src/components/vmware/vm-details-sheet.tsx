'use client';

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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VmPerformance } from '@/components/vmware/vm-performance';
import { logger } from '@/lib/logger';
import type { VM } from '@/types/vmware';
import { format } from 'date-fns';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  CpuIcon,
  Edit,
  HardDrive,
  MemoryStick as Memory,
  Network,
  PauseCircle,
  Play,
  Power,
  RotateCcw,
  StopCircle,
  Trash2,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

interface VmDetailsSheetProps {
  vm: VM;
  onCloseAction: () => void;
  onDeleteAction: (vmId: string) => void;
  onUpdateAction: (vm: VM) => void;
  onPowerOperationAction: (
    vmId: string,
    operation: 'start' | 'stop' | 'restart'
  ) => void;
}

export function VmDetailsSheet({
  vm,
  onCloseAction,
  onDeleteAction,
  onUpdateAction,
  onPowerOperationAction,
}: VmDetailsSheetProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

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

  // Handle confirming VM deletion
  const handleConfirmDelete = () => {
    onDeleteAction(vm.id);
    setConfirmDelete(false);
  };

  return (
    <>
      <Sheet open onOpenChange={open => !open && onCloseAction()}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={onCloseAction}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <SheetTitle className="text-xl">{vm.name}</SheetTitle>
            </div>
            <SheetDescription className="flex flex-wrap items-center gap-2">
              <span className="font-mono">{vm.id}</span>
              <span>•</span>
              {getStatusBadge(vm.status)}
              <span>•</span>
              <span className="capitalize">{vm.type}</span>
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Power State
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={vm.status === 'running' ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => onPowerOperationAction(vm.id, 'start')}
                    disabled={vm.status === 'running'}
                  >
                    <Play className="mr-2 h-4 w-4 text-green-500" />
                    Power On
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPowerOperationAction(vm.id, 'stop')}
                    disabled={vm.status === 'stopped'}
                  >
                    <Power className="mr-2 h-4 w-4 text-red-500" />
                    Power Off
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPowerOperationAction(vm.id, 'restart')}
                    disabled={vm.status !== 'running'}
                  >
                    <RotateCcw className="mr-2 h-4 w-4 text-amber-500" />
                    Restart
                  </Button>
                </div>
              </div>
            </div>

            <Tabs
              defaultValue="overview"
              className="mt-6"
              onValueChange={setActiveTab}
            >
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>VM Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          IP Address
                        </p>
                        <p className="text-sm font-medium">{vm.ip || '—'}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">OS</p>
                        <p className="text-sm font-medium">{vm.os}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">Created</p>
                        <p className="text-sm font-medium">
                          {format(vm.createdAt, 'MMM d, yyyy')}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Last Modified
                        </p>
                        <p className="text-sm font-medium">
                          {format(vm.lastModified, 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="flex flex-col items-center p-2 rounded-md border">
                        <CpuIcon className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">
                          {vm.cpu} vCPU
                        </span>
                        <span className="text-xs text-muted-foreground">
                          CPU
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-md border">
                        <Memory className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">
                          {vm.memory} GB
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Memory
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-md border">
                        <HardDrive className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">
                          {vm.storage} GB
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Storage
                        </span>
                      </div>
                      <div className="flex flex-col items-center p-2 rounded-md border">
                        <Network className="h-5 w-5 text-muted-foreground mb-1" />
                        <span className="text-sm font-medium">
                          {vm.network}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Network
                        </span>
                      </div>
                    </div>

                    {vm.description && (
                      <>
                        <Separator />
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Description
                          </p>
                          <p className="text-sm">{vm.description}</p>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {vm.tags.length > 0 ? (
                          vm.tags.map((tag) => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No tags
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Host Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Host Server
                        </p>
                        <p className="text-sm font-medium">{vm.hostServer}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Resource Pool
                        </p>
                        <p className="text-sm font-medium">{vm.resourcePool}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">
                          Datastore Path
                        </p>
                        <p className="text-sm font-medium">
                          {vm.datastorePath}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <VmPerformance vm={vm} />
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>VM Settings</CardTitle>
                    <CardDescription>Configure VM settings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            VM Hardware Version
                          </p>
                          <p className="text-sm font-medium">
                            VMware Virtual Machine Version 19
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Boot Delay
                          </p>
                          <p className="text-sm font-medium">0 ms</p>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          VM Options
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">VMware Tools</span>
                            <Badge
                              variant="outline"
                              className={
                                vm.status === 'running'
                                  ? 'bg-green-500/10 text-green-500 border-green-500'
                                  : 'text-muted-foreground'
                              }
                            >
                              {vm.status === 'running'
                                ? 'Running'
                                : 'Not Available'}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">
                              Hardware Virtualization
                            </span>
                            <Badge
                              variant="outline"
                              className="bg-green-500/10 text-green-500 border-green-500"
                            >
                              Enabled
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Memory Hotplug</span>
                            <Badge variant="outline">Disabled</Badge>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Notes
                        </p>
                        <p className="text-sm">
                          {vm.notes || 'No notes available for this VM.'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter className="gap-2 pt-4 mt-6 border-t">
            <Button
              variant="destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete VM
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                // In a real app, this would open a configuration form
                logger.info('Edit VM configuration');
              }}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit Configuration
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the virtual machine{' '}
              <strong>{vm.name}</strong>. This action cannot be undone.
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
