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
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  LampDesk as Desktop,
  FileWarning,
  Laptop,
  Lock,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Smartphone,
  Unlock,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Sample data for security status
const securityStatus = {
  overallScore: 85,
  criticalVulnerabilities: 12,
  highVulnerabilities: 35,
  mediumVulnerabilities: 78,
  lowVulnerabilities: 124,
  devicesUpToDate: 482,
  devicesOutdated: 105,
  totalDevices: 587,
};

// Sample data for security incidents
const securityIncidents = [
  {
    id: 'inc-001',
    deviceName: 'LAPTOP-DEV-08',
    deviceType: 'laptop',
    user: 'Mike Wilson',
    type: 'malware',
    severity: 'high',
    status: 'active',
    detectedAt: new Date('2025-04-15T10:30:00'),
    details: 'Trojan detected in downloaded file',
  },
  {
    id: 'inc-002',
    deviceName: 'DESKTOP-FIN-02',
    deviceType: 'desktop',
    user: 'Sarah Johnson',
    type: 'phishing',
    severity: 'medium',
    status: 'investigating',
    detectedAt: new Date('2025-04-14T15:45:00'),
    details: 'Potential phishing link accessed',
  },
  {
    id: 'inc-003',
    deviceName: 'SMARTPHONE-SALES-05',
    deviceType: 'smartphone',
    user: 'David Lee',
    type: 'unauthorized-access',
    severity: 'high',
    status: 'resolved',
    detectedAt: new Date('2025-04-13T09:15:00'),
    details: 'Multiple failed login attempts from unknown location',
  },
  {
    id: 'inc-004',
    deviceName: 'LAPTOP-HR-03',
    deviceType: 'laptop',
    user: 'Emily Johnson',
    type: 'data-leakage',
    severity: 'critical',
    status: 'active',
    detectedAt: new Date('2025-04-15T11:20:00'),
    details: 'Sensitive data emailed to external address',
  },
  {
    id: 'inc-005',
    deviceName: 'DESKTOP-MKT-04',
    deviceType: 'desktop',
    user: 'Robert Taylor',
    type: 'suspicious-activity',
    severity: 'medium',
    status: 'investigating',
    detectedAt: new Date('2025-04-14T16:30:00'),
    details: 'Unusual network traffic pattern detected',
  },
];

// Sample data for security trend over time
const securityTrendData = [
  { date: '2025-04-09', score: 82, incidents: 5 },
  { date: '2025-04-10', score: 83, incidents: 4 },
  { date: '2025-04-11', score: 81, incidents: 6 },
  { date: '2025-04-12', score: 84, incidents: 3 },
  { date: '2025-04-13', score: 86, incidents: 2 },
  { date: '2025-04-14', score: 84, incidents: 4 },
  { date: '2025-04-15', score: 85, incidents: 3 },
];

// Sample data for vulnerability types
const vulnerabilityTypesData = [
  { name: 'Software Outdated', value: 124 },
  { name: 'Missing Patches', value: 87 },
  { name: 'Insecure Config', value: 56 },
  { name: 'Weak Password', value: 38 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface EndpointSecurityProps {
  searchQuery: string;
}

export function EndpointSecurity({ searchQuery }: EndpointSecurityProps) {
  const [timeRange, setTimeRange] = useState('7d');
  const [filterStatus, setFilterStatus] = useState('all');

  // Get security score background
  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 70) return 'bg-amber-500';
    if (score >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // Get device type icon
  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'desktop':
        return <Desktop className="h-4 w-4 text-blue-500" />;
      case 'laptop':
        return <Laptop className="h-4 w-4 text-green-500" />;
      case 'smartphone':
        return <Smartphone className="h-4 w-4 text-purple-500" />;
      default:
        return <Laptop className="h-4 w-4" />;
    }
  };

  // Get incident type icon
  const getIncidentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'malware':
        return <FileWarning className="h-4 w-4 text-red-500" />;
      case 'phishing':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'unauthorized-access':
        return <Unlock className="h-4 w-4 text-amber-500" />;
      case 'data-leakage':
        return <FileWarning className="h-4 w-4 text-purple-500" />;
      case 'suspicious-activity':
        return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      default:
        return <ShieldAlert className="h-4 w-4" />;
    }
  };

  // Get severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <Badge variant="destructive">Critical</Badge>;
      case 'high':
        return <Badge className="bg-red-500">High</Badge>;
      case 'medium':
        return <Badge className="bg-amber-500">Medium</Badge>;
      case 'low':
        return <Badge className="bg-green-500">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge className="bg-red-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            Active
          </Badge>
        );
      case 'investigating':
        return (
          <Badge className="bg-blue-500">
            <Clock className="mr-1 h-3 w-3" />
            Investigating
          </Badge>
        );
      case 'mitigated':
        return (
          <Badge className="bg-amber-500">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Mitigated
          </Badge>
        );
      case 'resolved':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Resolved
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Filter incidents based on search query and filters
  const filteredIncidents = securityIncidents.filter(incident => {
    const matchesSearch =
      incident.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === 'all' || incident.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Security Score</CardTitle>
            <CardDescription>
              Overall security status of endpoints
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center space-y-2">
              <div
                className={`flex items-center justify-center w-32 h-32 rounded-full ${getScoreBackground(securityStatus.overallScore)} text-white`}
              >
                <span className="text-4xl font-bold">
                  {securityStatus.overallScore}
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mt-2">
                  Endpoint Score
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Critical Vulnerabilities
                  </span>
                  <span className="font-medium text-destructive">
                    {securityStatus.criticalVulnerabilities}
                  </span>
                </div>
                <Progress
                  value={securityStatus.criticalVulnerabilities / 2}
                  className="h-1"
                  indicatorClassName="bg-destructive"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    High Vulnerabilities
                  </span>
                  <span className="font-medium text-orange-500">
                    {securityStatus.highVulnerabilities}
                  </span>
                </div>
                <Progress
                  value={securityStatus.highVulnerabilities / 2}
                  className="h-1"
                  indicatorClassName="bg-orange-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Medium Vulnerabilities
                  </span>
                  <span className="font-medium text-amber-500">
                    {securityStatus.mediumVulnerabilities}
                  </span>
                </div>
                <Progress
                  value={securityStatus.mediumVulnerabilities / 2}
                  className="h-1"
                  indicatorClassName="bg-amber-500"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Low Vulnerabilities
                  </span>
                  <span className="font-medium text-blue-500">
                    {securityStatus.lowVulnerabilities}
                  </span>
                </div>
                <Progress
                  value={securityStatus.lowVulnerabilities / 2}
                  className="h-1"
                  indicatorClassName="bg-blue-500"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Security Trend</CardTitle>
                <CardDescription>
                  Security score and incidents over time
                </CardDescription>
              </div>
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="3m">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={securityTrendData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
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
                    yAxisId="left"
                    domain={[75, 100]}
                    tick={{
                      fontSize: 12,
                      fill: 'hsl(var(--muted-foreground))',
                    }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 10]}
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
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--chart-1))"
                    fill="hsl(var(--chart-1) / 20%)"
                    strokeWidth={2}
                    yAxisId="left"
                    name="Security Score"
                  />
                  <Area
                    type="monotone"
                    dataKey="incidents"
                    stroke="hsl(var(--destructive))"
                    fill="hsl(var(--destructive) / 20%)"
                    strokeWidth={2}
                    yAxisId="right"
                    name="Incidents"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Vulnerability Types</CardTitle>
            <CardDescription>
              Distribution by vulnerability category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vulnerabilityTypesData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {vulnerabilityTypesData.map(entry => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={
                          COLORS[
                            vulnerabilityTypesData.indexOf(entry) %
                              COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, 'Vulnerabilities']}
                    contentStyle={{
                      background: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2">
              {vulnerabilityTypesData.map(entry => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[
                          vulnerabilityTypesData.indexOf(entry) % COLORS.length
                        ],
                    }}
                  />
                  <span className="text-sm truncate">{entry.name}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between">
              <Button variant="outline" size="sm">
                See All Vulnerabilities
              </Button>
              <Button size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Scan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Security Incidents</CardTitle>
              <CardDescription>
                Active and recent security alerts
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative w-60">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search incidents..."
                  className="pl-8"
                  value={searchQuery}
                />
              </div>
              <Select
                defaultValue={filterStatus}
                onValueChange={setFilterStatus}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="investigating">Investigating</SelectItem>
                  <SelectItem value="mitigated">Mitigated</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Detected</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredIncidents.length > 0 ? (
                    filteredIncidents.map(incident => (
                      <TableRow key={incident.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDeviceIcon(incident.deviceType)}
                            <span className="font-medium">
                              {incident.deviceName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>{incident.user}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getIncidentIcon(incident.type)}
                            <span className="capitalize">
                              {incident.type.replace(/-/g, ' ')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(incident.severity)}
                        </TableCell>
                        <TableCell>{getStatusBadge(incident.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {incident.detectedAt.toLocaleDateString()}
                            <div className="text-xs text-muted-foreground">
                              {incident.detectedAt.toLocaleTimeString()}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {incident.details}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>View Details</DropdownMenuItem>
                              <DropdownMenuItem>Investigate</DropdownMenuItem>
                              <DropdownMenuItem>Mitigate</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                Mark as Resolved
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <ShieldCheck className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            No security incidents found
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Patch Status</CardTitle>
            <CardDescription>Endpoint software update status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-lg font-medium">
                    {(
                      (securityStatus.devicesUpToDate /
                        securityStatus.totalDevices) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Endpoints Fully Patched
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-lg font-medium">
                    {securityStatus.devicesOutdated}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    Endpoints Need Updates
                  </span>
                </div>
              </div>

              <Progress
                value={
                  (securityStatus.devicesUpToDate /
                    securityStatus.totalDevices) *
                  100
                }
                className="h-2"
                indicatorClassName="bg-green-500"
              />

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-4">
                  Missing Patch Categories
                </h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Operating System</span>
                      <span className="font-medium">{52} endpoints</span>
                    </div>
                    <Progress
                      value={(52 / securityStatus.devicesOutdated) * 100}
                      className="h-1.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Security Software</span>
                      <span className="font-medium">{78} endpoints</span>
                    </div>
                    <Progress
                      value={(78 / securityStatus.devicesOutdated) * 100}
                      className="h-1.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Office Suite</span>
                      <span className="font-medium">{35} endpoints</span>
                    </div>
                    <Progress
                      value={(35 / securityStatus.devicesOutdated) * 100}
                      className="h-1.5"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Other Applications</span>
                      <span className="font-medium">{42} endpoints</span>
                    </div>
                    <Progress
                      value={(42 / securityStatus.devicesOutdated) * 100}
                      className="h-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>Security policy compliance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-center">
                <div className="h-[180px]">
                  <ResponsiveContainer width={300} height="100%">
                    <BarChart
                      data={[
                        { name: 'Compliant', value: 517 },
                        { name: 'Non-Compliant', value: 70 },
                      ]}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="hsl(var(--border))"
                      />
                      <XAxis
                        type="number"
                        tick={{
                          fontSize: 12,
                          fill: 'hsl(var(--muted-foreground))',
                        }}
                      />
                      <YAxis
                        dataKey="name"
                        type="category"
                        tick={{
                          fontSize: 12,
                          fill: 'hsl(var(--muted-foreground))',
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '0.5rem',
                          color: 'hsl(var(--foreground))',
                        }}
                      />
                      <Bar
                        dataKey="value"
                        fill="hsl(var(--chart-2))"
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="text-sm font-medium mb-4">
                  Top Compliance Issues
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-amber-500" />
                      <div>
                        <p className="text-sm font-medium">
                          Endpoint Protection Disabled
                        </p>
                        <p className="text-xs text-muted-foreground">
                          12 devices affected
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Remediate
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4 text-orange-500" />
                      <div>
                        <p className="text-sm font-medium">
                          Disk Encryption Missing
                        </p>
                        <p className="text-xs text-muted-foreground">
                          18 devices affected
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Remediate
                    </Button>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-md bg-muted/50">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-sm font-medium">
                          Firewall Misconfigured
                        </p>
                        <p className="text-xs text-muted-foreground">
                          8 devices affected
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Remediate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
