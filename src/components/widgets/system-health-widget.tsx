'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';

// Mock data - in a real app, this would come from an API
const systemStatus = [
  {
    name: 'API Gateway',
    status: 'operational',
    uptime: 99.9,
  },
  {
    name: 'Auth Service',
    status: 'operational',
    uptime: 100,
  },
  {
    name: 'Database',
    status: 'degraded',
    uptime: 98.3,
  },
  {
    name: 'VM Provisioning',
    status: 'operational',
    uptime: 99.5,
  },
  {
    name: 'Monitoring',
    status: 'operational',
    uptime: 99.7,
  },
];

export function SystemHealthWidget() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded':
        return <Clock className="h-4 w-4 text-amber-500" />;
      case 'outage':
        return <XCircle className="h-4 w-4 text-destructive" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">System Health</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {systemStatus.map(system => (
            <div
              key={system.name}
              className="grid grid-cols-12 gap-2 items-center"
            >
              <div className="col-span-4">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(system.status)}
                  <span className="text-sm">{system.name}</span>
                </div>
              </div>
              <div className="col-span-6">
                <Progress value={system.uptime} className="h-2" />
              </div>
              <div className="col-span-2 text-right">
                <span className="text-xs">{system.uptime}%</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-md bg-muted p-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium">Overall System Status:</span>
            <span className="text-xs font-medium">Good</span>
          </div>
          <Progress value={98} className="h-2 mt-2" />
        </div>
      </CardContent>
    </Card>
  );
}
