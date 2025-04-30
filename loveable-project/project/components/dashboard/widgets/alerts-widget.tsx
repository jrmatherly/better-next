"use client"

import React from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Alert {
  id: string;
  type: 'critical' | 'warning' | 'info' | 'success';
  message: string;
  time: string;
  source: string;
}

const alerts: Alert[] = [
  {
    id: '1',
    type: 'critical',
    message: 'Database server CPU usage exceeded 90%',
    time: '15m ago',
    source: 'Database Cluster',
  },
  {
    id: '2',
    type: 'warning',
    message: 'Memory usage approaching threshold on App Server 03',
    time: '32m ago',
    source: 'App Server',
  },
  {
    id: '3',
    type: 'warning',
    message: 'High network latency detected in US-EAST zone',
    time: '1h ago',
    source: 'Network',
  },
  {
    id: '4',
    type: 'info',
    message: 'Scheduled maintenance starting in 2 hours',
    time: '2h ago',
    source: 'System',
  },
  {
    id: '5',
    type: 'success',
    message: 'Backup completed successfully',
    time: '3h ago',
    source: 'Backup Service',
  },
];

export function AlertsWidget() {
  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case 'info':
        return <Info className="h-4 w-4 text-blue-400" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getAlertBadge = (type: Alert['type']) => {
    switch (type) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500">Warning</Badge>;
      case 'info':
        return <Badge variant="secondary">Info</Badge>;
      case 'success':
        return <Badge className="bg-green-500">Success</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Badge variant="destructive" className="rounded-sm">2</Badge>
          <Badge className="bg-orange-500 rounded-sm">2</Badge>
          <Badge variant="secondary" className="rounded-sm">1</Badge>
        </div>
        <button className="text-xs text-primary">View All</button>
      </div>
      
      <ScrollArea className="h-[220px] pr-3">
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div key={alert.id} className="flex gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex-shrink-0 pt-1">
                {getAlertIcon(alert.type)}
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex justify-between items-start">
                  <p className="text-sm font-medium">{alert.message}</p>
                </div>
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>{alert.source}</span>
                    <span>·</span>
                    <span>{alert.time}</span>
                  </div>
                  {getAlertBadge(alert.type)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}