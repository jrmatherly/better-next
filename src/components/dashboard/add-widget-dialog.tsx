'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { WIDGET_TYPES } from '@/lib/constants/widget-types';
import {
  ClipboardList,
  FileText,
  Gauge,
  LayoutDashboard,
  Users,
  Zap,
} from 'lucide-react';

interface AddWidgetDialogProps {
  open: boolean;
  onOpenChangeAction: (open: boolean) => void;
  onAddWidgetAction: (widgetType: string) => void;
  activeWidgets: string[];
}

const widgetOptions = [
  {
    type: WIDGET_TYPES.RESOURCE_USAGE,
    name: 'Resource Usage',
    description: 'Shows CPU, memory, and storage usage',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    type: WIDGET_TYPES.SYSTEM_HEALTH,
    name: 'System Health',
    description: 'Displays system status and health metrics',
    icon: <Gauge className="h-5 w-5" />,
  },
  {
    type: WIDGET_TYPES.ACTIVE_REQUESTS,
    name: 'Active Requests',
    description: 'Lists pending resource and access requests',
    icon: <ClipboardList className="h-5 w-5" />,
  },
  {
    type: WIDGET_TYPES.QUICK_ACTIONS,
    name: 'Quick Actions',
    description: 'Shortcuts to common tasks and tools',
    icon: <Zap className="h-5 w-5" />,
  },
  {
    type: WIDGET_TYPES.DOCUMENTATION,
    name: 'Documentation',
    description: 'Quick access to recent docs and popular guides',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    type: WIDGET_TYPES.TEAM_UPDATES,
    name: 'Team Updates',
    description: 'Recent activity and updates from your teams',
    icon: <Users className="h-5 w-5" />,
  },
];

/**
 * Dialog component for adding new widgets to the dashboard
 */
export function AddWidgetDialog({
  open,
  onOpenChangeAction,
  onAddWidgetAction,
  activeWidgets,
}: AddWidgetDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChangeAction}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add a new widget</DialogTitle>
          <DialogDescription>
            Choose a widget to add to your dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
          {widgetOptions.map(widget => {
            const isActive = activeWidgets.includes(widget.type);

            return (
              <div
                key={widget.type}
                className="flex flex-col items-start space-y-2 border rounded-lg p-4"
              >
                <div className="flex items-center space-x-2">
                  <div className="rounded-full bg-primary/10 p-2">
                    {widget.icon}
                  </div>
                  <h3 className="font-medium">{widget.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {widget.description}
                </p>
                <Button
                  onClick={() => onAddWidgetAction(widget.type)}
                  variant={isActive ? 'outline' : 'default'}
                  className="mt-2"
                  disabled={isActive}
                >
                  {isActive ? 'Already Added' : 'Add Widget'}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
