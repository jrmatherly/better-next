"use client"

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  ArrowUpDown, 
  MoreHorizontal, 
  RefreshCw,
  Server,
  HardDrive,
  Cpu,
  Wifi,
  Cloud,
  Database,
  X,
  FileText
} from 'lucide-react';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ResourceTable } from '@/components/resources/resource-table';
import { ResourceStats } from '@/components/resources/resource-stats';
import { ResourceFilters } from '@/components/resources/resource-filters';
import { ResourceForm } from '@/components/resources/resource-form';
import { ResourceDetails } from '@/components/resources/resource-details';
import { ResourceAllocation } from '@/components/resources/resource-allocation';
import { ResourceCategory, Resource } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Sample resource categories
const resourceCategories: ResourceCategory[] = [
  { id: 'servers', name: 'Servers', icon: <Server className="h-4 w-4" /> },
  { id: 'storage', name: 'Storage', icon: <HardDrive className="h-4 w-4" /> },
  { id: 'compute', name: 'Compute', icon: <Cpu className="h-4 w-4" /> },
  { id: 'network', name: 'Network', icon: <Wifi className="h-4 w-4" /> },
  { id: 'cloud', name: 'Cloud Services', icon: <Cloud className="h-4 w-4" /> },
  { id: 'database', name: 'Databases', icon: <Database className="h-4 w-4" /> },
];

// Sample resources data
const initialResources: Resource[] = [
  {
    id: 'res-001',
    name: 'Production Web Server',
    type: 'Virtual Machine',
    category: 'servers',
    status: 'active',
    allocation: 85,
    location: 'US-East',
    lastUpdated: new Date('2025-03-10T14:30:00'),
    specs: {
      cpu: 8,
      memory: 32,
      storage: 500,
      os: 'Ubuntu 24.04 LTS',
    },
    tags: ['production', 'web', 'customer-facing'],
    owner: 'Infrastructure Team',
    description: 'Primary web server for the customer-facing application',
  },
  {
    id: 'res-002',
    name: 'Development Database',
    type: 'Database Instance',
    category: 'database',
    status: 'active',
    allocation: 45,
    location: 'US-West',
    lastUpdated: new Date('2025-03-12T09:15:00'),
    specs: {
      cpu: 4,
      memory: 16,
      storage: 1000,
      type: 'PostgreSQL',
      version: '15.2',
    },
    tags: ['development', 'database'],
    owner: 'Database Team',
    description: 'Development PostgreSQL database for application testing',
  },
  {
    id: 'res-003',
    name: 'File Storage Cluster',
    type: 'Storage System',
    category: 'storage',
    status: 'active',
    allocation: 62,
    location: 'US-Central',
    lastUpdated: new Date('2025-03-05T11:20:00'),
    specs: {
      capacity: '20TB',
      redundancy: 'RAID-10',
      throughput: '10Gbps',
    },
    tags: ['storage', 'production', 'backup'],
    owner: 'Storage Team',
    description: 'Central storage system for applications and backups',
  },
  {
    id: 'res-004',
    name: 'Load Balancer',
    type: 'Network Device',
    category: 'network',
    status: 'active',
    allocation: 70,
    location: 'US-East',
    lastUpdated: new Date('2025-03-08T16:45:00'),
    specs: {
      throughput: '40Gbps',
      connections: '500K concurrent',
      type: 'Hardware',
    },
    tags: ['network', 'production', 'traffic-management'],
    owner: 'Network Team',
    description: 'Primary load balancer for production web traffic',
  },
  {
    id: 'res-005',
    name: 'AWS EC2 Instances',
    type: 'Cloud Resource',
    category: 'cloud',
    status: 'active',
    allocation: 78,
    location: 'AWS us-east-1',
    lastUpdated: new Date('2025-03-14T10:30:00'),
    specs: {
      type: 'c5.2xlarge',
      instances: 8,
      billing: 'Reserved Instance',
    },
    tags: ['cloud', 'aws', 'production'],
    owner: 'Cloud Team',
    description: 'Production EC2 instances for microservices',
  },
  {
    id: 'res-006',
    name: 'Analytics Compute Cluster',
    type: 'Compute Resource',
    category: 'compute',
    status: 'maintenance',
    allocation: 0,
    location: 'US-West',
    lastUpdated: new Date('2025-03-01T08:00:00'),
    specs: {
      nodes: 12,
      cpu: 'AMD EPYC 7763',
      memory: '768GB total',
      storage: '24TB NVMe',
    },
    tags: ['analytics', 'big-data', 'compute'],
    owner: 'Data Science Team',
    description: 'High-performance compute cluster for analytics workloads',
  },
  {
    id: 'res-007',
    name: 'Development Web Server',
    type: 'Virtual Machine',
    category: 'servers',
    status: 'inactive',
    allocation: 0,
    location: 'US-East',
    lastUpdated: new Date('2025-02-28T17:00:00'),
    specs: {
      cpu: 4,
      memory: 16,
      storage: 250,
      os: 'Debian 12',
    },
    tags: ['development', 'web'],
    owner: 'Development Team',
    description: 'Web server for development and testing',
  },
  {
    id: 'res-008',
    name: 'MongoDB Cluster',
    type: 'Database Cluster',
    category: 'database',
    status: 'active',
    allocation: 55,
    location: 'US-Central',
    lastUpdated: new Date('2025-03-11T14:20:00'),
    specs: {
      nodes: 3,
      cpu: 8,
      memory: 64,
      storage: '2TB SSD',
      version: '6.0',
    },
    tags: ['database', 'mongodb', 'production'],
    owner: 'Database Team',
    description: 'Production MongoDB cluster for document storage',
  },
];

export function ResourcesPage() {
  const [resources, setResources] = useState<Resource[]>(initialResources);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingResource, setIsAddingResource] = useState(false);
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [isEditingResource, setIsEditingResource] = useState(false);
  const { toast } = useToast();

  // Filter resources based on category and search query
  const filteredResources = resources.filter(resource => {
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  // Group resources by category
  const resourcesByCategory = resourceCategories.map(category => ({
    ...category,
    count: resources.filter(r => r.category === category.id).length,
  }));

  // Calculate overall allocation
  const totalAllocation = resources.length > 0 
    ? Math.round(resources.reduce((sum, r) => sum + r.allocation, 0) / resources.length) 
    : 0;

  // Handle adding a new resource
  const handleAddResource = (resource: Omit<Resource, 'id'>) => {
    const newResource: Resource = {
      ...resource,
      id: `res-${(resources.length + 1).toString().padStart(3, '0')}`,
      lastUpdated: new Date(),
    };
    
    setResources([...resources, newResource]);
    setIsAddingResource(false);
    
    toast({
      title: "Resource added",
      description: `${newResource.name} has been added successfully.`,
    });
  };

  // Handle updating a resource
  const handleUpdateResource = (updatedResource: Resource) => {
    setResources(resources.map(r => 
      r.id === updatedResource.id ? { ...updatedResource, lastUpdated: new Date() } : r
    ));
    setSelectedResource(null);
    setIsEditingResource(false);
    
    toast({
      title: "Resource updated",
      description: `${updatedResource.name} has been updated successfully.`,
    });
  };

  // Handle deleting a resource
  const handleDeleteResource = (resourceId: string) => {
    const resourceToDelete = resources.find(r => r.id === resourceId);
    if (!resourceToDelete) return;
    
    setResources(resources.filter(r => r.id !== resourceId));
    setSelectedResource(null);
    
    toast({
      title: "Resource deleted",
      description: `${resourceToDelete.name} has been deleted.`,
      variant: "destructive",
    });
  };

  // Handle selecting a resource for viewing details
  const handleViewResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsEditingResource(false);
  };

  // Handle clearing the selected resource
  const handleClearSelection = () => {
    setSelectedResource(null);
    setIsEditingResource(false);
  };

  // Handle editing a resource
  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource);
    setIsEditingResource(true);
  };

  // Reset category filter
  const clearCategoryFilter = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">
            Manage and monitor your enterprise resources
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddingResource(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Resource
          </Button>
          <Button variant="outline" size="icon" title="Refresh Resources">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search resources..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedCategory && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {resourceCategories.find(c => c.id === selectedCategory)?.name}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-4 w-4 ml-1 p-0" 
                      onClick={clearCategoryFilter}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                </div>
              )}
              <ResourceFilters 
                categories={resourceCategories} 
                onSelectCategory={setSelectedCategory}
                selectedCategory={selectedCategory}
              />
            </div>
          </div>

          {filteredResources.length > 0 ? (
            <ResourceTable 
              resources={filteredResources} 
              onView={handleViewResource}
              onEdit={handleEditResource}
              onDelete={handleDeleteResource}
            />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No resources found</h3>
              <p className="text-sm text-muted-foreground max-w-sm mt-2">
                {searchQuery || selectedCategory 
                  ? "No resources match your current filters. Try adjusting your search or category selection."
                  : "You don't have any resources yet. Add your first resource to get started."}
              </p>
              {(searchQuery || selectedCategory) && (
                <Button 
                  variant="outline" 
                  className="mt-4" 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory(null);
                  }}
                >
                  Clear Filters
                </Button>
              )}
              {!searchQuery && !selectedCategory && (
                <Button 
                  className="mt-4" 
                  onClick={() => setIsAddingResource(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Resource
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Resource Allocation</CardTitle>
              <CardDescription>Overall resource utilization</CardDescription>
            </CardHeader>
            <CardContent>
              <ResourceAllocation allocation={totalAllocation} />
              <div className="mt-6 space-y-3">
                {resourcesByCategory.map(category => (
                  <div 
                    key={category.id} 
                    className="flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md"
                    onClick={() => setSelectedCategory(category.id === selectedCategory ? null : category.id)}
                  >
                    <div className="flex items-center gap-2">
                      {category.icon}
                      <span className="text-sm">{category.name}</span>
                    </div>
                    <Badge variant="outline">{category.count}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <ResourceStats resources={resources} />
        </div>
      </div>

      {/* Resource Details Drawer */}
      {selectedResource && !isEditingResource && (
        <ResourceDetails 
          resource={selectedResource} 
          onClose={handleClearSelection}
          onEdit={() => setIsEditingResource(true)}
          onDelete={handleDeleteResource}
        />
      )}

      {/* Add Resource Form */}
      {isAddingResource && (
        <ResourceForm 
          onSubmit={handleAddResource}
          onCancel={() => setIsAddingResource(false)}
          categories={resourceCategories}
          isNewResource
        />
      )}

      {/* Edit Resource Form */}
      {selectedResource && isEditingResource && (
        <ResourceForm 
          resource={selectedResource}
          onSubmit={handleUpdateResource}
          onCancel={() => {
            setIsEditingResource(false);
            setSelectedResource(null);
          }}
          categories={resourceCategories}
          isNewResource={false}
        />
      )}
    </div>
  );
}