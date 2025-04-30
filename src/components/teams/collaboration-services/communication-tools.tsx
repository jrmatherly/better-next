'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Phone,
  Upload,
  Video,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Sample data for communication tools
const communicationTools = [
  {
    id: 'tool-001',
    name: 'Microsoft Teams',
    type: 'messaging-video',
    status: 'operational',
    activeUsers: 685,
    license: 'Microsoft 365 E3',
    licenseStatus: 'active',
    licensedUsers: 800,
    dataUsage: 1.8, // TB
    messagesSent: 42500,
    messagesSentChange: '+12%',
    callsHosted: 1250,
    callsHostedChange: '+8%',
    fileShared: 845,
    fileSharedChange: '+5%',
  },
  {
    id: 'tool-002',
    name: 'Zoom',
    type: 'video',
    status: 'operational',
    activeUsers: 420,
    license: 'Business',
    licenseStatus: 'active',
    licensedUsers: 500,
    dataUsage: 1.2, // TB
    messagesSent: 0,
    messagesSentChange: '0%',
    callsHosted: 968,
    callsHostedChange: '+15%',
    fileShared: 120,
    fileSharedChange: '+2%',
  },
  {
    id: 'tool-003',
    name: 'Slack',
    type: 'messaging',
    status: 'incident',
    activeUsers: 542,
    license: 'Business+',
    licenseStatus: 'active',
    licensedUsers: 600,
    dataUsage: 0.9, // TB
    messagesSent: 68750,
    messagesSentChange: '+18%',
    callsHosted: 325,
    callsHostedChange: '+4%',
    fileShared: 1230,
    fileSharedChange: '+10%',
  },
  {
    id: 'tool-004',
    name: 'Outlook',
    type: 'email',
    status: 'operational',
    activeUsers: 745,
    license: 'Microsoft 365 E3',
    licenseStatus: 'active',
    licensedUsers: 800,
    dataUsage: 2.5, // TB
    messagesSent: 15680,
    messagesSentChange: '-5%',
    callsHosted: 0,
    callsHostedChange: '0%',
    fileShared: 3250,
    fileSharedChange: '+1%',
  },
  {
    id: 'tool-005',
    name: 'Google Meet',
    type: 'video',
    status: 'operational',
    activeUsers: 210,
    license: 'Google Workspace',
    licenseStatus: 'active',
    licensedUsers: 250,
    dataUsage: 0.5, // TB
    messagesSent: 0,
    messagesSentChange: '0%',
    callsHosted: 485,
    callsHostedChange: '+9%',
    fileShared: 75,
    fileSharedChange: '+3%',
  },
];

// Sample data for usage over time
const usageData = [
  { date: 'Mon', messages: 8500, calls: 260, meetings: 42 },
  { date: 'Tue', messages: 9200, calls: 310, meetings: 58 },
  { date: 'Wed', messages: 10500, calls: 280, meetings: 63 },
  { date: 'Thu', messages: 9800, calls: 285, meetings: 55 },
  { date: 'Fri', messages: 8900, calls: 250, meetings: 48 },
  { date: 'Sat', messages: 2200, calls: 85, meetings: 12 },
  { date: 'Sun', messages: 1900, calls: 75, meetings: 8 },
];

// Sample usage by department data
const departmentUsageData = [
  { name: 'Marketing', messages: 15800, calls: 450, meetings: 85 },
  { name: 'Sales', messages: 18500, calls: 620, meetings: 92 },
  { name: 'Development', messages: 25200, calls: 320, meetings: 78 },
  { name: 'Finance', messages: 8700, calls: 180, meetings: 45 },
  { name: 'HR', messages: 6500, calls: 210, meetings: 64 },
];

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
];

interface CommunicationToolsProps {
  searchQuery: string;
}

export function CommunicationTools({ searchQuery }: CommunicationToolsProps) {
  const [timeRange, setTimeRange] = useState('7d');

  // Get tool icon
  const getToolIcon = (type: string) => {
    if (type.includes('messaging') && type.includes('video')) {
      return (
        <div className="flex -space-x-1">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          <Video className="h-4 w-4 text-green-500" />
        </div>
      );
    }

    if (type.includes('messaging')) {
      return <MessageSquare className="h-4 w-4 text-blue-500" />;
    }

    if (type.includes('video')) {
      return <Video className="h-4 w-4 text-green-500" />;
    }

    if (type.includes('email')) {
      return <Mail className="h-4 w-4 text-purple-500" />;
    }

    return <MessageSquare className="h-4 w-4" />;
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Operational
          </Badge>
        );
      case 'incident':
        return (
          <Badge className="bg-amber-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Incident
          </Badge>
        );
      case 'maintenance':
        return (
          <Badge className="bg-blue-500">
            <Clock className="mr-1 h-3 w-3" />
            Maintenance
          </Badge>
        );
      case 'outage':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Outage
          </Badge>
        );
      default:
        return null;
    }
  };

  // Filter tools based on search
  const filteredTools = communicationTools.filter(
    tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.license.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usage Metrics</CardTitle>
                  <CardDescription>
                    Weekly communication activity
                  </CardDescription>
                </div>
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Time Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                    <SelectItem value="90d">Last 90 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={usageData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
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
                    />
                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))',
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="messages"
                      stackId="1"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1) / 60%)"
                      name="Messages"
                    />
                    <Area
                      type="monotone"
                      dataKey="calls"
                      stackId="2"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2) / 60%)"
                      name="Calls"
                    />
                    <Area
                      type="monotone"
                      dataKey="meetings"
                      stackId="3"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3) / 60%)"
                      name="Meetings"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Communication Summary</CardTitle>
              <CardDescription>Platform usage statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span>Messages</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium">42.5K</span>
                    <span className="text-xs text-green-500">
                      +12% vs last week
                    </span>
                  </div>
                </div>
                <Progress
                  value={85}
                  className="h-1.5"
                  indicatorClassName="bg-blue-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-500" />
                    <span>Calls</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium">1.25K</span>
                    <span className="text-xs text-green-500">
                      +8% vs last week
                    </span>
                  </div>
                </div>
                <Progress
                  value={62}
                  className="h-1.5"
                  indicatorClassName="bg-green-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Video className="h-4 w-4 text-purple-500" />
                    <span>Video Meetings</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium">286</span>
                    <span className="text-xs text-green-500">
                      +5% vs last week
                    </span>
                  </div>
                </div>
                <Progress
                  value={48}
                  className="h-1.5"
                  indicatorClassName="bg-purple-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-amber-500" />
                    <span>Emails</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium">15.6K</span>
                    <span className="text-xs text-red-500">
                      -5% vs last week
                    </span>
                  </div>
                </div>
                <Progress
                  value={35}
                  className="h-1.5"
                  indicatorClassName="bg-amber-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-red-500" />
                    <span>Files Shared</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-medium">5.42K</span>
                    <span className="text-xs text-green-500">
                      +7% vs last week
                    </span>
                  </div>
                </div>
                <Progress
                  value={54}
                  className="h-1.5"
                  indicatorClassName="bg-red-500"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Communication Tools</CardTitle>
          <CardDescription>
            Active communication platforms and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredTools.map(tool => (
              <div key={tool.id} className="border rounded-md overflow-hidden">
                <div className="p-4 flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      {getToolIcon(tool.type)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{tool.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span className="capitalize">
                          {tool.type.replace('-', ' & ')}
                        </span>
                        <span>•</span>
                        <span>{tool.license}</span>
                        <span>•</span>
                        {getStatusBadge(tool.status)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Configure</DropdownMenuItem>
                        <DropdownMenuItem>View Usage Reports</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>Manage Licenses</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="bg-muted/50 p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          Active Users
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-sm">{tool.activeUsers}</span>
                          <span className="text-xs text-muted-foreground">
                            / {tool.licensedUsers}
                          </span>
                        </div>
                      </div>
                      <Progress
                        value={(tool.activeUsers / tool.licensedUsers) * 100}
                        className="h-1.5"
                        indicatorClassName={
                          tool.activeUsers / tool.licensedUsers > 0.9
                            ? 'bg-amber-500'
                            : 'bg-blue-500'
                        }
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Usage Rate</span>
                        <span>
                          {Math.round(
                            (tool.activeUsers / tool.licensedUsers) * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                          <span className="text-sm">Messages</span>
                        </div>
                        <span className="text-sm font-medium">
                          {tool.messagesSent > 0
                            ? tool.messagesSent.toLocaleString()
                            : '-'}
                        </span>
                      </div>
                      {tool.messagesSent > 0 && (
                        <span
                          className={`text-xs self-end ${
                            tool.messagesSentChange.startsWith('+')
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {tool.messagesSentChange} vs last month
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3.5 w-3.5 text-green-500" />
                          <span className="text-sm">Calls/Meetings</span>
                        </div>
                        <span className="text-sm font-medium">
                          {tool.callsHosted > 0
                            ? tool.callsHosted.toLocaleString()
                            : '-'}
                        </span>
                      </div>
                      {tool.callsHosted > 0 && (
                        <span
                          className={`text-xs self-end ${
                            tool.callsHostedChange.startsWith('+')
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {tool.callsHostedChange} vs last month
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-1">
                        <div className="flex items-center gap-1">
                          <Upload className="h-3.5 w-3.5 text-purple-500" />
                          <span className="text-sm">Files Shared</span>
                        </div>
                        <span className="text-sm font-medium">
                          {tool.fileShared > 0
                            ? tool.fileShared.toLocaleString()
                            : '-'}
                        </span>
                      </div>
                      {tool.fileShared > 0 && (
                        <span
                          className={`text-xs self-end ${
                            tool.fileSharedChange.startsWith('+')
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}
                        >
                          {tool.fileSharedChange} vs last month
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Usage Analysis</CardTitle>
          <CardDescription>
            Communication tool usage by department
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={departmentUsageData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: 'hsl(var(--foreground))',
                  }}
                />
                <Legend />
                <Bar
                  dataKey="messages"
                  name="Messages"
                  fill="hsl(var(--chart-1))"
                />
                <Bar dataKey="calls" name="Calls" fill="hsl(var(--chart-2))" />
                <Bar
                  dataKey="meetings"
                  name="Meetings"
                  fill="hsl(var(--chart-3))"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-between mt-6 pt-4 border-t">
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">
                Top Department
              </span>
              <span className="text-sm font-medium">Development</span>
              <span className="text-xs text-muted-foreground">
                25.2k messages
              </span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-muted-foreground">
                Most Active Time
              </span>
              <span className="text-sm font-medium">10:00 AM - 2:00 PM</span>
              <span className="text-xs text-muted-foreground">
                Tuesday & Wednesday
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
