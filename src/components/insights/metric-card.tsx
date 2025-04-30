'use client';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDown, ArrowUp } from 'lucide-react';
import React from 'react';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  status: 'success' | 'warning' | 'error' | 'info';
  icon: React.ReactElement<{ className?: string }>;
}

export function MetricCard({
  title,
  value,
  change,
  status,
  icon,
}: MetricCardProps) {
  // Determine if change is positive or negative
  const isPositive = !change.startsWith('-');
  const numericChange = change.replace(/[+\-%]/g, '');

  // Get appropriate color classes based on status
  const getStatusClasses = () => {
    switch (status) {
      case 'success':
        return 'text-green-500';
      case 'warning':
        return 'text-orange-500';
      case 'error':
        return 'text-destructive';
      case 'info':
        return 'text-blue-500';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline">
              <p className={cn('text-3xl font-bold', getStatusClasses())}>
                {value}
              </p>
              <div
                className={cn(
                  'ml-2 flex items-center text-sm',
                  isPositive
                    ? status === 'success'
                      ? 'text-green-500'
                      : 'text-destructive'
                    : status === 'success'
                      ? 'text-destructive'
                      : 'text-green-500'
                )}
              >
                {isPositive ? (
                  <ArrowUp className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDown className="mr-1 h-3 w-3" />
                )}
                <span>{numericChange}%</span>
              </div>
            </div>
          </div>
          <div
            className={cn(
              'p-2 rounded-md',
              status === 'success'
                ? 'bg-green-500/10'
                : status === 'warning'
                  ? 'bg-orange-500/10'
                  : status === 'error'
                    ? 'bg-destructive/10'
                    : 'bg-blue-500/10'
            )}
          >
            {React.cloneElement(icon, {
              className: cn(
                'h-5 w-5',
                getStatusClasses(),
                icon.props.className
              ),
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
