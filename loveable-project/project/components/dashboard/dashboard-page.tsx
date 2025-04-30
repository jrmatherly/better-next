"use client"

import React, { useState } from 'react';
import { Grid, PlusCircle, Minus, Archive, Copy, AlertCircle, Activity } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@/lib/drag-drop';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { ResourceWidget } from '@/components/dashboard/widgets/resource-widget';
import { AlertsWidget } from '@/components/dashboard/widgets/alerts-widget';
import { StatusWidget } from '@/components/dashboard/widgets/status-widget';
import { MetricsWidget } from '@/components/dashboard/widgets/metrics-widget';
import { RequestsWidget } from '@/components/dashboard/widgets/requests-widget';
import { DocumentationWidget } from '@/components/dashboard/widgets/documentation-widget';

// Define widget types
type WidgetSize = 'small' | 'medium' | 'large';
type WidgetId = string;

interface Widget {
  id: WidgetId;
  type: string;
  size: WidgetSize;
  title: string;
  component: React.ReactNode;
}

export function DashboardPage() {
  const { user } = useAuth();
  
  // Initial widgets for dashboard
  const initialWidgets: Widget[] = [
    {
      id: 'resource-usage',
      type: 'resource',
      size: 'medium',
      title: 'Resource Usage',
      component: <ResourceWidget />,
    },
    {
      id: 'active-alerts',
      type: 'alerts',
      size: 'small',
      title: 'Active Alerts',
      component: <AlertsWidget />,
    },
    {
      id: 'system-status',
      type: 'status',
      size: 'small',
      title: 'System Status',
      component: <StatusWidget />,
    },
    {
      id: 'performance-metrics',
      type: 'metrics',
      size: 'medium',
      title: 'Performance Metrics',
      component: <MetricsWidget />,
    },
    {
      id: 'recent-requests',
      type: 'requests',
      size: 'medium',
      title: 'Recent Requests',
      component: <RequestsWidget />,
    },
    {
      id: 'documentation-updates',
      type: 'documentation',
      size: 'small',
      title: 'Documentation Updates',
      component: <DocumentationWidget />,
    },
  ];

  // State for widgets
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [activeTab, setActiveTab] = useState('main');

  // Add widget
  const handleAddWidget = (widgetType: string) => {
    let newWidget: Widget;
    
    switch (widgetType) {
      case 'resource':
        newWidget = {
          id: `resource-${Date.now()}`,
          type: 'resource',
          size: 'medium',
          title: 'Resource Usage',
          component: <ResourceWidget />,
        };
        break;
      case 'alerts':
        newWidget = {
          id: `alerts-${Date.now()}`,
          type: 'alerts',
          size: 'small',
          title: 'Active Alerts',
          component: <AlertsWidget />,
        };
        break;
      case 'status':
        newWidget = {
          id: `status-${Date.now()}`,
          type: 'status',
          size: 'small',
          title: 'System Status',
          component: <StatusWidget />,
        };
        break;
      case 'metrics':
        newWidget = {
          id: `metrics-${Date.now()}`,
          type: 'metrics',
          size: 'medium',
          title: 'Performance Metrics',
          component: <MetricsWidget />,
        };
        break;
      case 'requests':
        newWidget = {
          id: `requests-${Date.now()}`,
          type: 'requests',
          size: 'medium',
          title: 'Recent Requests',
          component: <RequestsWidget />,
        };
        break;
      case 'documentation':
        newWidget = {
          id: `documentation-${Date.now()}`,
          type: 'documentation',
          size: 'small',
          title: 'Documentation Updates',
          component: <DocumentationWidget />,
        };
        break;
      default:
        return;
    }
    
    setWidgets([...widgets, newWidget]);
  };

  // Remove widget
  const handleRemoveWidget = (widgetId: WidgetId) => {
    setWidgets(widgets.filter(widget => widget.id !== widgetId));
  };

  // Handle widget reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setWidgets(items);
  };

  // Reset to default widgets
  const resetWidgets = () => {
    setWidgets(initialWidgets);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">
            Here's an overview of your enterprise resources and operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => handleAddWidget('resource')}>
                <Activity className="mr-2 h-4 w-4" />
                Resource Usage
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('alerts')}>
                <AlertCircle className="mr-2 h-4 w-4" />
                Active Alerts
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('status')}>
                <Activity className="mr-2 h-4 w-4" />
                System Status
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('metrics')}>
                <Activity className="mr-2 h-4 w-4" />
                Performance Metrics
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('requests')}>
                <Copy className="mr-2 h-4 w-4" />
                Recent Requests
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddWidget('documentation')}>
                <Archive className="mr-2 h-4 w-4" />
                Documentation Updates
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" size="icon" onClick={resetWidgets} title="Reset Dashboard">
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="main" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="main">Main Dashboard</TabsTrigger>
          <TabsTrigger value="team">Team Dashboard</TabsTrigger>
          <TabsTrigger value="custom">Custom View</TabsTrigger>
        </TabsList>
        <TabsContent value="main" className="space-y-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="widgets" direction="vertical">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 transition-all"
                >
                  {widgets.map((widget, index) => (
                    <Draggable key={widget.id} draggableId={widget.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={cn(
                            "bg-card rounded-lg shadow-sm border",
                            widget.size === 'small' && "col-span-1",
                            widget.size === 'medium' && "col-span-1 md:col-span-1",
                            widget.size === 'large' && "col-span-1 md:col-span-2 lg:col-span-3"
                          )}
                        >
                          <div 
                            className="p-4 border-b flex items-center justify-between"
                            {...provided.dragHandleProps}
                          >
                            <h3 className="font-medium">{widget.title}</h3>
                            <div className="flex items-center gap-1">
                              <Grid className="h-4 w-4 text-muted-foreground cursor-move" />
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleRemoveWidget(widget.id)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-4">{widget.component}</div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </TabsContent>
        <TabsContent value="team">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium">Team Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Customize this dashboard with team-specific widgets and metrics
            </p>
            <Button variant="outline" className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Team Widgets
            </Button>
          </div>
        </TabsContent>
        <TabsContent value="custom">
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <h3 className="text-lg font-medium">Custom Dashboard</h3>
            <p className="text-sm text-muted-foreground">
              Create your own dashboard with the widgets and metrics you need
            </p>
            <Button variant="outline" className="mt-4">
              <PlusCircle className="mr-2 h-4 w-4" />
              Configure Custom View
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}