'use client';

import { AlertsPanel } from '@/components/insights/alerts-panel';
import { FilterPanel } from '@/components/insights/filter-panel';
import { HistoricalData } from '@/components/insights/historical-data';
import { MetricCard } from '@/components/insights/metric-card';
import { PerformanceMetrics } from '@/components/insights/performance-metrics';
import { SystemStatus } from '@/components/insights/system-status';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Clock, Download, RefreshCw, Search } from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

export function InsightsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState('24h');
  const [isLoading, setIsLoading] = useState(false);

  // Handle refresh
  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: 'Monitoring data refreshed',
        description: 'Latest monitoring data has been loaded.',
      });
    }, 1500);
  };

  // Handle time range change
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    toast({
      title: 'Time range updated',
      description: `Showing data for the last ${range}`,
    });
  };

  // Handle export data
  const handleExportData = () => {
    toast({
      title: 'Export initiated',
      description:
        "Monitoring data export has started. You'll be notified when it's ready.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            System Monitoring
          </h1>
          <p className="text-muted-foreground">
            Monitor system performance, health status, and alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportData}>
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
            />
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search metrics, alerts, or systems..."
            className="pl-8"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <FilterPanel
            onTimeRangeChangeAction={handleTimeRangeChange}
            timeRange={timeRange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="CPU Usage"
          value="67%"
          change="+5%"
          status="warning"
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          title="Memory Usage"
          value="45%"
          change="-2%"
          status="success"
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          title="Disk Space"
          value="78%"
          change="+1%"
          status="warning"
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Alerts"
          value="4"
          change="+2"
          status="error"
          icon={<AlertCircle className="h-4 w-4" />}
        />
      </div>

      <Tabs defaultValue="overview" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="historical">Historical Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <SystemStatus timeRange={timeRange} />
            </div>
            <div className="space-y-6">
              <AlertsPanel limit={5} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <PerformanceMetrics timeRange={timeRange} />
        </TabsContent>

        <TabsContent value="alerts">
          <AlertsPanel />
        </TabsContent>

        <TabsContent value="historical">
          <HistoricalData timeRange={timeRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
