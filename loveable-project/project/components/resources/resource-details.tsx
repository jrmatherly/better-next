"use client"

import React from 'react';
import { format } from 'date-fns';
import { ArrowLeft, Edit, Trash2, CheckCircle2, AlertTriangle, Clock, HelpCircle } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Resource } from '@/lib/types';

interface ResourceDetailsProps {
  resource: Resource;
  onClose: () => void;
  onEdit: () => void;
  onDelete: (resourceId: string) => void;
}

export function ResourceDetails({ resource, onClose, onEdit, onDelete }: ResourceDetailsProps) {
  // Get status badge based on resource status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle2 className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case 'inactive':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <Clock className="mr-1 h-3 w-3" />
            Inactive
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-orange-500 text-white">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Maintenance
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
        return (
          <Badge variant="outline">
            <HelpCircle className="mr-1 h-3 w-3" />
            {status}
          </Badge>
        );
    }
  };

  // Get allocation color based on percentage
  const getAllocationColor = (allocation: number) => {
    if (allocation >= 90) return 'bg-destructive';
    if (allocation >= 75) return 'bg-orange-500';
    if (allocation >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <Sheet open={!!resource} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="sm:max-w-lg overflow-y-auto">
        <SheetHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-full"
              onClick={onClose}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <SheetTitle className="text-xl">{resource.name}</SheetTitle>
          </div>
          <SheetDescription className="flex flex-wrap items-center gap-2">
            <span>{resource.type}</span>
            <span>•</span>
            <span>{resource.location}</span>
            <span>•</span>
            {getStatusBadge(resource.status)}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <p className="text-sm">{resource.description}</p>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-4 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Resource Allocation</h3>
                {resource.status === 'active' ? (
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{resource.allocation}% utilized</span>
                      <span>{100 - resource.allocation}% available</span>
                    </div>
                    <Progress
                      value={resource.allocation}
                      className="h-2"
                      indicatorClassName={getAllocationColor(resource.allocation)}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Resource is not currently active.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">ID</h3>
                  <p className="text-sm font-mono">{resource.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Owner</h3>
                  <p className="text-sm">{resource.owner}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Last Updated</h3>
                <p className="text-sm">{format(resource.lastUpdated, 'PPP p')}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="specs" className="mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Technical Specifications</CardTitle>
                  <CardDescription>Resource configuration details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {Object.entries(resource.specs).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 gap-2 py-1 border-b border-muted last:border-0">
                      <span className="text-sm font-medium capitalize">{key}</span>
                      <span className="text-sm">{value.toString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tags" className="mt-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-muted-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <Separator className="my-6" />

        <SheetFooter className="flex-row justify-between gap-2 sm:space-x-0">
          <Button
            variant="destructive"
            onClick={() => onDelete(resource.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
          <Button 
            variant="default"
            onClick={onEdit}
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Resource
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}