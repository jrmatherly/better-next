'use client';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  BarChart as BarChartIcon,
  CalendarIcon,
  Clock,
  Download,
  LineChart as LineChartIcon,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Generate sample data
const generateDailyData = (days: number) => {
  const data = [];
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    data.push({
      date: format(date, 'MMM dd'),
      cpu: 45 + Math.random() * 40,
      memory: 50 + Math.random() * 35,
      disk: 60 + Math.random() * 30,
      network: 30 + Math.random() * 50,
      errors: Math.floor(Math.random() * 10),
      requests: 2000 + Math.floor(Math.random() * 4000),
      responseTime: 100 + Math.random() * 200,
    });
  }

  return data;
};

const generateWeeklyData = (weeks: number) => {
  const data = [];
  const now = new Date();

  for (let i = weeks; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    data.push({
      date: `W${format(date, 'w')}`,
      cpu: 45 + Math.random() * 40,
      memory: 50 + Math.random() * 35,
      disk: 60 + Math.random() * 30,
      network: 30 + Math.random() * 50,
      errors: Math.floor(Math.random() * 40),
      requests: 15000 + Math.floor(Math.random() * 30000),
      responseTime: 120 + Math.random() * 150,
    });
  }

  return data;
};

const generateMonthlyData = (months: number) => {
  const data = [];
  const now = new Date();

  for (let i = months; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    data.push({
      date: format(date, 'MMM yyyy'),
      cpu: 45 + Math.random() * 40,
      memory: 50 + Math.random() * 35,
      disk: 60 + Math.random() * 30,
      network: 30 + Math.random() * 50,
      errors: Math.floor(Math.random() * 100),
      requests: 60000 + Math.floor(Math.random() * 100000),
      responseTime: 130 + Math.random() * 120,
    });
  }

  return data;
};

// Interface for component props
interface HistoricalDataProps {
  timeRange: string;
}

import type {
  DateRange,
  HistoricalMetric,
  OnSelectDateRangeHandler,
} from '@/types/monitoring';

export function HistoricalData({ timeRange }: HistoricalDataProps) {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    to: new Date(),
  });
  const [selectedMetric, setSelectedMetric] = useState('cpu');
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [groupBy, setGroupBy] = useState('daily');

  // Choose data based on grouping
  let historicalData: HistoricalMetric[];
  switch (groupBy) {
    case 'daily':
      historicalData = generateDailyData(30);
      break;
    case 'weekly':
      historicalData = generateWeeklyData(12);
      break;
    case 'monthly':
      historicalData = generateMonthlyData(12);
      break;
    default:
      historicalData = generateDailyData(30);
  }

  // Function to format metric name
  const formatMetricName = (metric: string) => {
    switch (metric) {
      case 'cpu':
        return 'CPU Usage (%)';
      case 'memory':
        return 'Memory Usage (%)';
      case 'disk':
        return 'Disk Usage (%)';
      case 'network':
        return 'Network Utilization (%)';
      case 'errors':
        return 'Error Count';
      case 'requests':
        return 'Request Count';
      case 'responseTime':
        return 'Response Time (ms)';
      default:
        return metric;
    }
  };

  // Get color for metric
  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'cpu':
        return 'hsl(var(--chart-1))';
      case 'memory':
        return 'hsl(var(--chart-2))';
      case 'disk':
        return 'hsl(var(--chart-3))';
      case 'network':
        return 'hsl(var(--chart-4))';
      case 'errors':
        return 'hsl(var(--destructive))';
      case 'requests':
        return 'hsl(var(--chart-5))';
      case 'responseTime':
        return 'hsl(var(--blue-500))';
      default:
        return 'hsl(var(--chart-1))';
    }
  };

  const handleDateRangeSelect: OnSelectDateRangeHandler = value => {
    setDateRange(value ?? { from: undefined, to: undefined });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Historical Metrics</CardTitle>
              <CardDescription>
                Analyze system metrics over time
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setChartType('line')}
                >
                  <LineChartIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant={chartType === 'bar' ? 'default' : 'outline'}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setChartType('bar')}
                >
                  <BarChartIcon className="h-4 w-4" />
                </Button>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className={cn(
                      'justify-start text-left font-normal w-[240px]',
                      !dateRange && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeSelect}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpu">CPU Usage</SelectItem>
                <SelectItem value="memory">Memory Usage</SelectItem>
                <SelectItem value="disk">Disk Usage</SelectItem>
                <SelectItem value="network">Network Utilization</SelectItem>
                <SelectItem value="errors">Error Count</SelectItem>
                <SelectItem value="requests">Request Count</SelectItem>
                <SelectItem value="responseTime">Response Time</SelectItem>
              </SelectContent>
            </Select>

            <Select value={groupBy} onValueChange={setGroupBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Group by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart
                  data={historicalData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 12,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    domain={
                      selectedMetric === 'requests' ? [0, 'auto'] : [0, 100]
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: number) => [
                      `${value}${selectedMetric === 'responseTime' ? 'ms' : selectedMetric === 'requests' ? '' : '%'}`,
                      formatMetricName(selectedMetric),
                    ]}
                    labelFormatter={label => `Date: ${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey={selectedMetric}
                    stroke={getMetricColor(selectedMetric)}
                    strokeWidth={2}
                    dot={false}
                    name={formatMetricName(selectedMetric)}
                  />
                </LineChart>
              ) : (
                <BarChart
                  data={historicalData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fontSize: 12,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    angle={-45}
                    textAnchor="end"
                  />
                  <YAxis
                    tick={{
                      fontSize: 12,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                    domain={
                      selectedMetric === 'requests' ? [0, 'auto'] : [0, 100]
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                    formatter={(value: number) => [
                      `${value}${selectedMetric === 'responseTime' ? 'ms' : selectedMetric === 'requests' ? '' : '%'}`,
                      formatMetricName(selectedMetric),
                    ]}
                    labelFormatter={label => `Date: ${label}`}
                  />
                  <Bar
                    dataKey={selectedMetric}
                    fill={getMetricColor(selectedMetric)}
                    radius={[4, 4, 0, 0]}
                    name={formatMetricName(selectedMetric)}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center mt-6 pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Data updated every 5 minutes</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Viewing {historicalData.length} data points
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
