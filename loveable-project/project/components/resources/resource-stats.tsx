"use client"

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Resource } from '@/lib/types';

interface ResourceStatsProps {
  resources: Resource[];
}

export function ResourceStats({ resources }: ResourceStatsProps) {
  // Calculate statistics from resources
  const stats = useMemo(() => {
    const totalCount = resources.length;
    const activeCount = resources.filter(r => r.status === 'active').length;
    const maintenanceCount = resources.filter(r => r.status === 'maintenance').length;
    const inactiveCount = resources.filter(r => r.status === 'inactive').length;
    
    // Get unique types
    const uniqueTypes = new Set(resources.map(r => r.type));
    
    // Get unique locations
    const uniqueLocations = new Set(resources.map(r => r.location));

    // Calculate average allocation for active resources
    const activeResources = resources.filter(r => r.status === 'active');
    const averageAllocation = activeResources.length > 0
      ? Math.round(activeResources.reduce((sum, r) => sum + r.allocation, 0) / activeResources.length)
      : 0;

    // Count resources by category
    const byCategory = resources.reduce((acc, resource) => {
      acc[resource.category] = (acc[resource.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCount,
      activeCount,
      maintenanceCount,
      inactiveCount,
      uniqueTypesCount: uniqueTypes.size,
      uniqueLocationsCount: uniqueLocations.size,
      averageAllocation,
      byCategory,
    };
  }, [resources]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Resource Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Total Resources</span>
              <span className="text-2xl font-bold">{stats.totalCount}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Active Resources</span>
              <span className="text-2xl font-bold">{stats.activeCount}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Active</span>
              <span className="text-xs">{stats.activeCount} ({Math.round((stats.activeCount / stats.totalCount) * 100) || 0}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Maintenance</span>
              <span className="text-xs">{stats.maintenanceCount} ({Math.round((stats.maintenanceCount / stats.totalCount) * 100) || 0}%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Inactive</span>
              <span className="text-xs">{stats.inactiveCount} ({Math.round((stats.inactiveCount / stats.totalCount) * 100) || 0}%)</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t">
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Average Allocation</span>
              <span className="text-xs">{stats.averageAllocation}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Resource Types</span>
              <span className="text-xs">{stats.uniqueTypesCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-muted-foreground">Locations</span>
              <span className="text-xs">{stats.uniqueLocationsCount}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}