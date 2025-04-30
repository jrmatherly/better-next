'use client';

import { FieldConnectivity } from '@/components/teams/field-technology/field-connectivity';
import { FieldDevices } from '@/components/teams/field-technology/field-devices';
import { FieldLocations } from '@/components/teams/field-technology/field-locations';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Signal,
  Smartphone,
  WifiOff,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

export function FieldTechnologyPage() {
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
        description: 'Field technology data has been refreshed.',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Field Technology
          </h1>
          <p className="text-muted-foreground">
            Manage remote locations, field devices, and connectivity
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              toast({
                title: 'Creating new device',
                description: 'This feature is coming soon.',
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            New Device
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
            placeholder="Search locations, devices, or connectivity..."
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
                  Field Locations
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">24</p>
                  <Badge className="ml-2 bg-blue-500">+2</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-blue-500/10">
                <MapPin className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Devices
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">138</p>
                  <Badge className="ml-2 bg-green-500">+5</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-green-500/10">
                <Smartphone className="h-5 w-5 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Connectivity Status
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">92%</p>
                  <Badge className="ml-2 bg-amber-500">-3%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-amber-500/10">
                <Signal className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Issues Reported
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">7</p>
                  <Badge className="ml-2 bg-red-500">+2</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-red-500/10">
                <WifiOff className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="locations">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-4">
          <TabsTrigger value="locations">Field Locations</TabsTrigger>
          <TabsTrigger value="devices">Field Devices</TabsTrigger>
          <TabsTrigger value="connectivity">Connectivity</TabsTrigger>
        </TabsList>

        <TabsContent value="locations">
          <FieldLocations searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="devices">
          <FieldDevices searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="connectivity">
          <FieldConnectivity searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
