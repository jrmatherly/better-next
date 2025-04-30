'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ClusterStatus } from '@/components/vmware/cluster-status';
import { ResourcePool } from '@/components/vmware/resource-pool';
import { VmDetailsSheet } from '@/components/vmware/vm-details-sheet';
import { VmList } from '@/components/vmware/vm-list';
import { VmProvisionForm } from '@/components/vmware/vm-provision-form';
import { VmwareFilters } from '@/components/vmware/vmware-filters';
import { useToast } from '@/hooks/use-toast';
import { sampleVMs } from '@/lib/constants/vmware-data';
import type { VM } from '@/types/vmware';
import { Plus, PlusSquare, RefreshCw, Search, Server } from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

export function VmwarePage() {
  const { toast } = useToast();
  const [vms, setVMs] = useState<VM[]>(sampleVMs);
  const [selectedVM, setSelectedVM] = useState<VM | null>(null);
  const [isCreatingVM, setIsCreatingVM] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [openTab, setOpenTab] = useState('vms');

  // Filter VMs based on filters and search query
  const filteredVMs = vms.filter(vm => {
    // Apply search filter
    const matchesSearch =
      !searchQuery ||
      vm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vm.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vm.tags.some(tag =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    // Apply status filter
    const matchesStatus = !statusFilter || vm.status === statusFilter;

    // Apply type filter
    const matchesType = !typeFilter || vm.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Handle creating a new VM
  const handleCreateVM = (vmData: Partial<VM>) => {
    const newVM: VM = {
      id: `vm-${Date.now().toString(36)}`,
      name: vmData.name || 'New VM',
      description: vmData.description || '',
      status: 'stopped',
      type: vmData.type || 'server',
      ip: '—',
      cpu: vmData.cpu || 2,
      memory: vmData.memory || 4,
      storage: vmData.storage || 50,
      network: vmData.network || '1 Gbps',
      os: vmData.os || 'Ubuntu 24.04 LTS',
      createdAt: new Date(),
      lastModified: new Date(),
      powerState: 'poweredOff',
      hostServer: vmData.hostServer || 'esx01.example.com',
      resourcePool: vmData.resourcePool || 'Production',
      datastorePath: `[datastore1] ${vmData.name || 'New VM'}/`,
      performanceMetrics: {
        cpuUsage: 0,
        memoryUsage: 0,
        diskIops: 0,
        networkThroughput: 0,
      },
      tags: vmData.tags || [],
      notes: vmData.notes || '',
    };

    setVMs([...vms, newVM]);
    setIsCreatingVM(false);

    toast({
      title: 'VM creation initiated',
      description:
        'Your virtual machine is being created. This may take a few minutes.',
    });
  };

  // Handle deleting a VM
  const handleDeleteVM = (vmId: string) => {
    setVMs(vms.filter(vm => vm.id !== vmId));
    setSelectedVM(null);

    toast({
      title: 'VM deleted',
      description: 'The virtual machine has been successfully deleted.',
      variant: 'destructive',
    });
  };

  // Handle updating VM
  const handleUpdateVM = (updatedVM: VM) => {
    // Update the VM in the list
    setVMs(
      vms.map(vm =>
        vm.id === updatedVM.id ? { ...updatedVM, lastModified: new Date() } : vm
      )
    );

    // Update the selected VM to show the changes, but don't close the details sheet
    setSelectedVM({ ...updatedVM, lastModified: new Date() });

    toast({
      title: 'VM updated',
      description: 'The virtual machine has been successfully updated.',
    });
  };

  // Handle power operations
  const handlePowerOperation = (
    vmId: string,
    operation: 'start' | 'stop' | 'restart'
  ) => {
    const vm = vms.find(vm => vm.id === vmId);
    if (!vm) return;

    let newPowerState: string;
    let newStatus: string;
    let message: string;

    switch (operation) {
      case 'start':
        newPowerState = 'poweredOn';
        newStatus = 'running';
        message = 'VM is starting. This may take a moment.';
        break;
      case 'stop':
        newPowerState = 'poweredOff';
        newStatus = 'stopped';
        message = 'VM is shutting down.';
        break;
      case 'restart':
        newPowerState = 'poweredOn';
        newStatus = 'running';
        message = 'VM is restarting. This may take a moment.';
        break;
      default:
        return;
    }

    setVMs(
      vms.map(vm =>
        vm.id === vmId
          ? {
              ...vm,
              powerState: newPowerState,
              status: newStatus,
              lastModified: new Date(),
            }
          : vm
      )
    );

    toast({
      title: `VM ${operation} initiated`,
      description: message,
    });
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Data refreshed',
        description: 'VMware environment data has been refreshed.',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            VMware Infrastructure
          </h1>
          <p className="text-muted-foreground">
            Manage virtual machines, clusters, and resource pools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsCreatingVM(true)}>
            <PlusSquare className="mr-2 h-4 w-4" />
            New VM
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search virtual machines..."
            className="pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <VmwareFilters
            statusFilter={statusFilter}
            typeFilter={typeFilter}
            onStatusFilterChangeAction={setStatusFilter}
            onTypeFilterChangeAction={setTypeFilter}
            onClearFiltersAction={() => {
              setStatusFilter(null);
              setTypeFilter(null);
            }}
          />
        </div>
      </div>

      <Tabs defaultValue="vms" onValueChange={setOpenTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="vms">Virtual Machines</TabsTrigger>
          <TabsTrigger value="clusters">Clusters</TabsTrigger>
          <TabsTrigger value="resources">Resource Pools</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="vms">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <VmList
                vms={filteredVMs}
                onVmSelectAction={setSelectedVM}
                onPowerOperationAction={handlePowerOperation}
              />
            </div>
            <div className="space-y-6">
              <ClusterStatus />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="clusters">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ClusterStatus detailed />
            <ResourcePool />
          </div>
        </TabsContent>

        <TabsContent value="resources">
          <ResourcePool detailed />
        </TabsContent>

        <TabsContent value="templates">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <Server className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">VM Templates</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Create and manage VM templates for faster provisioning
            </p>
            <Button className="mt-4" onClick={() => setIsCreatingVM(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* VM Details Sheet */}
      {selectedVM && (
        <VmDetailsSheet
          vm={selectedVM}
          onCloseAction={() => setSelectedVM(null)}
          onDeleteAction={handleDeleteVM}
          onUpdateAction={handleUpdateVM}
          onPowerOperationAction={handlePowerOperation}
        />
      )}

      {/* VM Provisioning Form */}
      {isCreatingVM && (
        <VmProvisionForm
          onSubmitAction={handleCreateVM}
          onCancelAction={() => setIsCreatingVM(false)}
        />
      )}
    </div>
  );
}
