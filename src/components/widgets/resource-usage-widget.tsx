'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Mock data - in a real app, this would come from an API
const data = [
  { name: '12:00', cpu: 40, memory: 35, storage: 20 },
  { name: '13:00', cpu: 38, memory: 42, storage: 21 },
  { name: '14:00', cpu: 65, memory: 48, storage: 22 },
  { name: '15:00', cpu: 52, memory: 53, storage: 22 },
  { name: '16:00', cpu: 48, memory: 49, storage: 23 },
  { name: '17:00', cpu: 75, memory: 62, storage: 25 },
  { name: '18:00', cpu: 60, memory: 58, storage: 30 },
];

export function ResourceUsageWidget() {
  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Resource Usage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[90%] w-full">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={data}
              margin={{ top: 5, right: 0, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="name"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis fontSize={10} tickLine={false} axisLine={false} unit="%" />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="cpu"
                name="CPU"
                stackId="1"
                stroke="hsl(var(--chart-1))"
                fill="hsl(var(--chart-1))"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="memory"
                name="Memory"
                stackId="2"
                stroke="hsl(var(--chart-2))"
                fill="hsl(var(--chart-2))"
                fillOpacity={0.6}
              />
              <Area
                type="monotone"
                dataKey="storage"
                name="Storage"
                stackId="3"
                stroke="hsl(var(--chart-3))"
                fill="hsl(var(--chart-3))"
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-3 gap-4 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">CPU</span>
            <span className="text-lg font-bold">60%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Memory</span>
            <span className="text-lg font-bold">58%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Storage</span>
            <span className="text-lg font-bold">30%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
