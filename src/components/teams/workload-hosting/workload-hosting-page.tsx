'use client';

import { WorkloadDeployments } from '@/components/teams/workload-hosting/workload-deployments';
import { WorkloadOverview } from '@/components/teams/workload-hosting/workload-overview';
import { WorkloadResources } from '@/components/teams/workload-hosting/workload-resources';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  Cpu,
  Database,
  HardDrive,
  Layers,
  Plus,
  RefreshCw,
  Search,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

export function WorkloadHostingPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Data refreshed',
        description: 'Workload hosting data has been refreshed.',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Workload Hosting
          </h1>
          <p className="text-muted-foreground">
            Manage cloud workloads, containers, and hosting environments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              toast({
                title: 'Creating new workload',
                description: 'This feature is coming soon.',
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            New Workload
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
            placeholder="Search workloads, containers, services..."
            className="pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Workloads
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">42</p>
                  <Badge className="ml-2 bg-green-500">+4</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-green-500/10">
                <Layers className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  CPU Usage
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">68%</p>
                  <Badge className="ml-2 bg-orange-500">+12%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-orange-500/10">
                <Cpu className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Memory Allocation
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">74%</p>
                  <Badge className="ml-2 bg-blue-500">+5%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-blue-500/10">
                <HardDrive className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Storage Used
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">52%</p>
                  <Badge className="ml-2 bg-purple-500">+2%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-purple-500/10">
                <Database className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="deployments">Deployments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <WorkloadOverview />
        </TabsContent>

        <TabsContent value="resources">
          <WorkloadResources />
        </TabsContent>

        <TabsContent value="deployments">
          <WorkloadDeployments />
        </TabsContent>
      </Tabs>
    </div>
  );
}
