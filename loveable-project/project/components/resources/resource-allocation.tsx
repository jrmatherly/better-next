"use client"

import React from 'react';
import { Progress } from '@/components/ui/progress';

interface ResourceAllocationProps {
  allocation: number;
}

export function ResourceAllocation({ allocation }: ResourceAllocationProps) {
  // Get allocation color based on percentage
  const getAllocationColor = (allocation: number) => {
    if (allocation >= 90) return 'bg-destructive';
    if (allocation >= 75) return 'bg-orange-500';
    if (allocation >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  // Get status text based on allocation
  const getStatusText = (allocation: number) => {
    if (allocation >= 90) return 'Critical';
    if (allocation >= 75) return 'Warning';
    if (allocation >= 50) return 'Moderate';
    return 'Good';
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{allocation}% utilized</span>
        <span className="font-medium">{getStatusText(allocation)}</span>
      </div>
      <Progress
        value={allocation}
        className="h-2"
        indicatorClassName={getAllocationColor(allocation)}
      />
      <div className="flex justify-between text-xs text-muted-foreground mt-1">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  );
}