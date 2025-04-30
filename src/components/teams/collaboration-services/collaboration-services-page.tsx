'use client';

import { CommunicationTools } from '@/components/teams/collaboration-services/communication-tools';
import { DocumentCollaboration } from '@/components/teams/collaboration-services/document-collaboration';
import { ProjectManagement } from '@/components/teams/collaboration-services/project-management';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  FileText,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Users,
  Video,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

export function CollaborationServicesPage() {
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
        description: 'Collaboration services data has been refreshed.',
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Collaboration Services
          </h1>
          <p className="text-muted-foreground">
            Manage communication, document sharing, and teamwork tools
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() =>
              toast({
                title: 'New integration',
                description: 'This feature is coming soon.',
              })
            }
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Service
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
            placeholder="Search collaboration tools, services, and integrations..."
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
                  Active Users
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">752</p>
                  <Badge className="ml-2 bg-green-500">+24</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-blue-500/10">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Messages Today
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">4.2k</p>
                  <Badge className="ml-2 bg-amber-500">+12%</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-amber-500/10">
                <MessageSquare className="h-5 w-5 text-amber-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Active Projects
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">68</p>
                  <Badge className="ml-2 bg-purple-500">+3</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-purple-500/10">
                <FileText className="h-5 w-5 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  Meetings Today
                </p>
                <div className="flex items-baseline">
                  <p className="text-3xl font-bold">57</p>
                  <Badge className="ml-2 bg-red-500">+8</Badge>
                </div>
              </div>
              <div className="p-2 rounded-md bg-red-500/10">
                <Video className="h-5 w-5 text-red-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="communication">
        <TabsList className="grid grid-cols-1 md:grid-cols-3 mb-4">
          <TabsTrigger value="communication">Communication Tools</TabsTrigger>
          <TabsTrigger value="documents">Document Collaboration</TabsTrigger>
          <TabsTrigger value="projects">Project Management</TabsTrigger>
        </TabsList>

        <TabsContent value="communication">
          <CommunicationTools searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentCollaboration searchQuery={searchQuery} />
        </TabsContent>

        <TabsContent value="projects">
          <ProjectManagement searchQuery={searchQuery} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
