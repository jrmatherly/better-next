'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Clock, Filter } from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';

interface FilterPanelProps {
  timeRange: string;
  onTimeRangeChangeAction: (range: string) => void;
}

export function FilterPanel({
  timeRange,
  onTimeRangeChangeAction,
}: FilterPanelProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Time Range:</span> {timeRange}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>Select Time Range</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={() => onTimeRangeChangeAction('1h')}
            className={timeRange === '1h' ? 'bg-muted' : ''}
          >
            <Clock className="mr-2 h-4 w-4" />
            Last 1 hour
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onTimeRangeChangeAction('6h')}
            className={timeRange === '6h' ? 'bg-muted' : ''}
          >
            <Clock className="mr-2 h-4 w-4" />
            Last 6 hours
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onTimeRangeChangeAction('12h')}
            className={timeRange === '12h' ? 'bg-muted' : ''}
          >
            <Clock className="mr-2 h-4 w-4" />
            Last 12 hours
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onTimeRangeChangeAction('24h')}
            className={timeRange === '24h' ? 'bg-muted' : ''}
          >
            <Clock className="mr-2 h-4 w-4" />
            Last 24 hours
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onTimeRangeChangeAction('7d')}
            className={timeRange === '7d' ? 'bg-muted' : ''}
          >
            <Clock className="mr-2 h-4 w-4" />
            Last 7 days
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onTimeRangeChangeAction('30d')}
            className={timeRange === '30d' ? 'bg-muted' : ''}
          >
            <Clock className="mr-2 h-4 w-4" />
            Last 30 days
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
