"use client"

import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Sample metrics data for different periods
const hourlyData = [
  { time: '00:00', value: 45, requests: 120, errors: 2 },
  { time: '04:00', value: 38, requests: 90, errors: 1 },
  { time: '08:00', value: 65, requests: 210, errors: 3 },
  { time: '12:00', value: 78, requests: 270, errors: 4 },
  { time: '16:00', value: 82, requests: 290, errors: 2 },
  { time: '20:00', value: 60, requests: 180, errors: 1 },
];

const dailyData = [
  { time: 'Mon', value: 62, requests: 890, errors: 12 },
  { time: 'Tue', value: 68, requests: 920, errors: 14 },
  { time: 'Wed', value: 70, requests: 930, errors: 10 },
  { time: 'Thu', value: 75, requests: 980, errors: 8 },
  { time: 'Fri', value: 68, requests: 940, errors: 11 },
  { time: 'Sat', value: 50, requests: 680, errors: 6 },
  { time: 'Sun', value: 45, requests: 560, errors: 5 },
];

const weeklyData = [
  { time: 'W1', value: 65, requests: 4200, errors: 42 },
  { time: 'W2', value: 68, requests: 4500, errors: 38 },
  { time: 'W3', value: 72, requests: 4800, errors: 45 },
  { time: 'W4', value: 70, requests: 4700, errors: 40 },
];

type MetricType = 'load' | 'requests' | 'errors';
type TimeRange = 'hourly' | 'daily' | 'weekly';

export function MetricsWidget() {
  const [metricType, setMetricType] = useState<MetricType>('load');
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');

  // Get data based on selected time range
  const getData = () => {
    switch (timeRange) {
      case 'hourly':
        return hourlyData;
      case 'daily':
        return dailyData;
      case 'weekly':
        return weeklyData;
      default:
        return dailyData;
    }
  };

  // Render chart based on selected metric type
  const renderChart = () => {
    const data = getData();

    switch (metricType) {
      case 'load':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                unit="%" 
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value: number) => [`${value}%`, 'Load']}
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="hsl(var(--chart-1))" 
                fill="hsl(var(--chart-1) / 20%)" 
                strokeWidth={2} 
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      case 'requests':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value: number) => [value, 'Requests']}
              />
              <Line 
                type="monotone" 
                dataKey="requests" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2} 
                dot={{ r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'errors':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              />
              <Tooltip 
                contentStyle={{ 
                  background: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem',
                  color: 'hsl(var(--foreground))'
                }}
                formatter={(value: number) => [value, 'Errors']}
              />
              <Bar 
                dataKey="errors" 
                fill="hsl(var(--destructive))" 
                barSize={20}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-2">
        <Select value={metricType} onValueChange={(value) => setMetricType(value as MetricType)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select metric" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="load">System Load</SelectItem>
            <SelectItem value="requests">Requests</SelectItem>
            <SelectItem value="errors">Errors</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hourly">Last 24 Hours</SelectItem>
            <SelectItem value="daily">Last 7 Days</SelectItem>
            <SelectItem value="weekly">Last 4 Weeks</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {renderChart()}
      
      <div className="flex justify-between text-sm">
        <div className="flex flex-col">
          <span className="text-muted-foreground">Average</span>
          <span className="font-medium">
            {metricType === 'load' ? '67%' : metricType === 'requests' ? '857' : '9'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Peak</span>
          <span className="font-medium">
            {metricType === 'load' ? '82%' : metricType === 'requests' ? '980' : '14'}
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-muted-foreground">Current</span>
          <span className="font-medium">
            {metricType === 'load' ? '70%' : metricType === 'requests' ? '930' : '10'}
          </span>
        </div>
      </div>
    </div>
  );
}