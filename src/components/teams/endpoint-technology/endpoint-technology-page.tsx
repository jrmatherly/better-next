'use client';

import { EndpointInventory } from '@/components/teams/endpoint-technology/endpoint-inventory';
import { EndpointSecurity } from '@/components/teams/endpoint-technology/endpoint-security';
import { EndpointSoftware } from '@/components/teams/endpoint-technology/endpoint-software';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  CheckCircle,
  LampDesk as Desktop,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

export function EndpointTechnologyPage() {
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
        description: 'Endpoint technology data has been refreshed.',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Endpoint Technology
          </h1>
          <p className="text-muted-foreground">
            Manage desktops, laptops, and other endpoint devices
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              toast({
                title: 'Adding new endpoint',
                description: 'This feature is coming soon.',
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Endpoint
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
            placeholder="Search devices, software, or security status..."
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
                  Total Endpoints
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">587</p>
                  <Badge className="ml-2 bg-green-500">+12</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-blue-500/10">
                <Desktop className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Security Status
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">92%</p>
                  <Badge className="ml-2 bg-amber-500">-3%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-green-500/10">
                <Shield className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Compliance Rate
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">88%</p>
                  <Badge className="ml-2 bg-green-500">+2%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-purple-500/10">
                <CheckCircle className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Critical Issues
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">23</p>
                  <Badge className="ml-2 bg-red-500">+5</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-red-500/10">
                <ShieldAlert className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-4">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="software">Software</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <EndpointInventory searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="security">
          <EndpointSecurity searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="software">
          <EndpointSoftware searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
