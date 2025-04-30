"use client"

import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceStatus {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'outage';
  uptime: string;
}

const services: ServiceStatus[] = [
  {
    id: '1',
    name: 'Authentication',
    status: 'operational',
    uptime: '99.99%',
  },
  {
    id: '2',
    name: 'Database Cluster',
    status: 'operational',
    uptime: '99.97%',
  },
  {
    id: '3',
    name: 'Load Balancers',
    status: 'operational',
    uptime: '100%',
  },
  {
    id: '4',
    name: 'Storage Service',
    status: 'degraded',
    uptime: '99.5%',
  },
  {
    id: '5',
    name: 'API Gateway',
    status: 'operational',
    uptime: '99.98%',
  },
  {
    id: '6',
    name: 'CDN',
    status: 'operational',
    uptime: '99.99%',
  },
];

export function StatusWidget() {
  const getStatusIndicator = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'operational':
        return (
          <div className="flex items-center">
            <CheckCircle2 className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">Operational</span>
          </div>
        );
      case 'degraded':
        return (
          <div className="flex items-center">
            <span className="h-3 w-3 rounded-full bg-orange-400 mr-1" />
            <span className="text-xs text-orange-400">Degraded</span>
          </div>
        );
      case 'outage':
        return (
          <div className="flex items-center">
            <XCircle className="h-3 w-3 text-destructive mr-1" />
            <span className="text-xs text-destructive">Outage</span>
          </div>
        );
      default:
        return null;
    }
  };

  const countByStatus = {
    operational: services.filter(s => s.status === 'operational').length,
    degraded: services.filter(s => s.status === 'degraded').length,
    outage: services.filter(s => s.status === 'outage').length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        <div className="flex flex-col items-center justify-center p-2 rounded-md bg-green-500/10">
          <span className="text-green-500 font-medium text-xl">{countByStatus.operational}</span>
          <span className="text-xs text-muted-foreground">Operational</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-md bg-orange-500/10">
          <span className="text-orange-400 font-medium text-xl">{countByStatus.degraded}</span>
          <span className="text-xs text-muted-foreground">Degraded</span>
        </div>
        <div className="flex flex-col items-center justify-center p-2 rounded-md bg-destructive/10">
          <span className="text-destructive font-medium text-xl">{countByStatus.outage}</span>
          <span className="text-xs text-muted-foreground">Outage</span>
        </div>
      </div>

      <div className="space-y-2">
        {services.map((service) => (
          <div 
            key={service.id} 
            className={cn(
              "flex justify-between items-center p-2 rounded-md",
              service.status === 'degraded' && "bg-orange-500/5",
              service.status === 'outage' && "bg-destructive/5"
            )}
          >
            <div className="font-medium text-sm">{service.name}</div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-muted-foreground">{service.uptime}</div>
              {getStatusIndicator(service.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}