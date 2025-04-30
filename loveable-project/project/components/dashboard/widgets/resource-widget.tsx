"use client"

import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ResourceDataItem {
  name: string;
  value: number;
  color: string;
}

interface UsageDataItem {
  timestamp: string;
  cpu: number;
  memory: number;
  storage: number;
}

// Resource allocation data
const resourceAllocationData: ResourceDataItem[] = [
  { name: 'Compute', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'Memory', value: 30, color: 'hsl(var(--chart-2))' },
  { name: 'Storage', value: 15, color: 'hsl(var(--chart-3))' },
  { name: 'Network', value: 10, color: 'hsl(var(--chart-4))' },
];

// Resource usage data over time
const usageData: UsageDataItem[] = [
  { timestamp: '00:00', cpu: 25, memory: 40, storage: 55 },
  { timestamp: '04:00', cpu: 30, memory: 45, storage: 55 },
  { timestamp: '08:00', cpu: 65, memory: 60, storage: 56 },
  { timestamp: '12:00', cpu: 85, memory: 70, storage: 58 },
  { timestamp: '16:00', cpu: 70, memory: 65, storage: 59 },
  { timestamp: '20:00', cpu: 45, memory: 50, storage: 60 },
  { timestamp: '24:00', cpu: 30, memory: 45, storage: 60 },
];

export function ResourceWidget() {
  return (
    <Tabs defaultValue="allocation" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="allocation">Resource Allocation</TabsTrigger>
        <TabsTrigger value="usage">Usage Trends</TabsTrigger>
      </TabsList>
      <TabsContent value="allocation" className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resourceAllocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {resourceAllocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value}%`, 'Allocation']}
                  contentStyle={{ 
                    background: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--foreground))'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2">
            {resourceAllocationData.map((resource, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: resource.color }}
                  />
                  <span className="text-sm font-medium">{resource.name}</span>
                </div>
                <span className="text-sm">{resource.value}%</span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Usage</span>
                <span className="font-medium">68%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available</span>
                <span className="font-medium">32%</span>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
      <TabsContent value="usage">
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={usageData}
              margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="timestamp" 
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
                formatter={(value: number) => [`${value}%`, '']}
              />
              <Line 
                type="monotone" 
                dataKey="cpu" 
                stroke="hsl(var(--chart-1))" 
                strokeWidth={2} 
                dot={{ r: 2 }}
                name="CPU"
              />
              <Line 
                type="monotone" 
                dataKey="memory" 
                stroke="hsl(var(--chart-2))" 
                strokeWidth={2} 
                dot={{ r: 2 }}
                name="Memory"
              />
              <Line 
                type="monotone" 
                dataKey="storage" 
                stroke="hsl(var(--chart-3))" 
                strokeWidth={2} 
                dot={{ r: 2 }}
                name="Storage"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between items-center pt-2 mt-2 border-t">
          <div className="flex gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2 bg-[hsl(var(--chart-1))]" />
              <span className="text-xs">CPU</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2 bg-[hsl(var(--chart-2))]" />
              <span className="text-xs">Memory</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full mr-2 bg-[hsl(var(--chart-3))]" />
              <span className="text-xs">Storage</span>
            </div>
          </div>
          <button className="text-xs text-primary">View Details</button>
        </div>
      </TabsContent>
    </Tabs>
  );
}