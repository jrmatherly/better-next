'use client';

import { AddWidgetDialog } from '@/components/dashboard/add-widget-dialog';
import { Button } from '@/components/ui/button';
import { ActiveRequestsWidget } from '@/components/widgets/active-requests-widget';
import { DocumentationWidget } from '@/components/widgets/documentation-widget';
import { QuickActionsWidget } from '@/components/widgets/quick-actions-widget';
import { ResourceUsageWidget } from '@/components/widgets/resource-usage-widget';
import { SystemHealthWidget } from '@/components/widgets/system-health-widget';
import { TeamUpdatesWidget } from '@/components/widgets/team-updates-widget';
import { WIDGET_TYPES } from '@/lib/constants/widget-types';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import type { Layout, Layouts } from 'react-grid-layout';

const ResponsiveGridLayout = WidthProvider(Responsive);

// Default layout configuration
const defaultLayouts: Layouts = {
  lg: [
    { i: WIDGET_TYPES.RESOURCE_USAGE, x: 0, y: 0, w: 6, h: 2 },
    { i: WIDGET_TYPES.SYSTEM_HEALTH, x: 6, y: 0, w: 6, h: 2 },
    { i: WIDGET_TYPES.ACTIVE_REQUESTS, x: 0, y: 2, w: 4, h: 2 },
    { i: WIDGET_TYPES.QUICK_ACTIONS, x: 4, y: 2, w: 4, h: 2 },
    { i: WIDGET_TYPES.DOCUMENTATION, x: 8, y: 2, w: 4, h: 2 },
    { i: WIDGET_TYPES.TEAM_UPDATES, x: 0, y: 4, w: 12, h: 2 },
  ],
  md: [
    { i: WIDGET_TYPES.RESOURCE_USAGE, x: 0, y: 0, w: 4, h: 2 },
    { i: WIDGET_TYPES.SYSTEM_HEALTH, x: 4, y: 0, w: 4, h: 2 },
    { i: WIDGET_TYPES.ACTIVE_REQUESTS, x: 0, y: 2, w: 4, h: 2 },
    { i: WIDGET_TYPES.QUICK_ACTIONS, x: 4, y: 2, w: 4, h: 2 },
    { i: WIDGET_TYPES.DOCUMENTATION, x: 0, y: 4, w: 4, h: 2 },
    { i: WIDGET_TYPES.TEAM_UPDATES, x: 4, y: 4, w: 4, h: 2 },
  ],
  sm: [
    { i: WIDGET_TYPES.RESOURCE_USAGE, x: 0, y: 0, w: 2, h: 2 },
    { i: WIDGET_TYPES.SYSTEM_HEALTH, x: 2, y: 0, w: 2, h: 2 },
    { i: WIDGET_TYPES.ACTIVE_REQUESTS, x: 0, y: 2, w: 2, h: 2 },
    { i: WIDGET_TYPES.QUICK_ACTIONS, x: 2, y: 2, w: 2, h: 2 },
    { i: WIDGET_TYPES.DOCUMENTATION, x: 0, y: 4, w: 2, h: 2 },
    { i: WIDGET_TYPES.TEAM_UPDATES, x: 2, y: 4, w: 2, h: 2 },
  ],
};

/**
 * Grid layout component for dashboard widgets
 */
export function DashboardGrid() {
  const [layouts, setLayouts] = useState<Layouts>(defaultLayouts);
  const [activeWidgets, setActiveWidgets] = useState<string[]>([
    WIDGET_TYPES.RESOURCE_USAGE,
    WIDGET_TYPES.SYSTEM_HEALTH,
    WIDGET_TYPES.ACTIVE_REQUESTS,
    WIDGET_TYPES.QUICK_ACTIONS,
    WIDGET_TYPES.DOCUMENTATION,
    WIDGET_TYPES.TEAM_UPDATES,
  ]);
  const [isAddWidgetOpen, setIsAddWidgetOpen] = useState(false);

  const handleLayoutChange = (layout: Layout[], allLayouts: Layouts) => {
    setLayouts(allLayouts);
    // Here you could also save the layout to backend
  };

  const renderWidget = (type: string) => {
    switch (type) {
      case WIDGET_TYPES.RESOURCE_USAGE:
        return <ResourceUsageWidget />;
      case WIDGET_TYPES.SYSTEM_HEALTH:
        return <SystemHealthWidget />;
      case WIDGET_TYPES.ACTIVE_REQUESTS:
        return <ActiveRequestsWidget />;
      case WIDGET_TYPES.QUICK_ACTIONS:
        return <QuickActionsWidget />;
      case WIDGET_TYPES.DOCUMENTATION:
        return <DocumentationWidget />;
      case WIDGET_TYPES.TEAM_UPDATES:
        return <TeamUpdatesWidget />;
      default:
        return <div>Unknown widget type</div>;
    }
  };

  const addWidgetAction = (widgetType: string) => {
    if (!activeWidgets.includes(widgetType)) {
      setActiveWidgets([...activeWidgets, widgetType]);
      // Here you would also update the layouts to include the new widget
    }
    setIsAddWidgetOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={() => setIsAddWidgetOpen(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Add Widget</span>
        </Button>
      </div>
      <div className="border rounded-lg bg-card">
        <ResponsiveGridLayout
          className="layout"
          layouts={layouts}
          breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
          cols={{ lg: 12, md: 8, sm: 4, xs: 2, xxs: 1 }}
          rowHeight={180}
          isDraggable
          isResizable
          onLayoutChange={handleLayoutChange}
        >
          {activeWidgets.map(widgetType => (
            <div
              key={widgetType}
              className="bg-card rounded-md shadow-sm overflow-hidden"
            >
              {renderWidget(widgetType)}
            </div>
          ))}
        </ResponsiveGridLayout>
      </div>
      <AddWidgetDialog
        open={isAddWidgetOpen}
        onOpenChangeAction={setIsAddWidgetOpen}
        onAddWidgetAction={addWidgetAction}
        activeWidgets={activeWidgets}
      />
    </div>
  );
}
