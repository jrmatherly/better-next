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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import {
  CheckCircle,
  Clock,
  Download,
  File,
  FileImage,
  FilePlus2,
  FileSpreadsheet,
  FileText,
  Link,
  MoreHorizontal,
  Pencil,
  Search,
  Share2,
  Users,
} from 'lucide-react';
import React, { useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

// Sample document collaboration platforms
const collaborationPlatforms = [
  {
    id: 'platform-001',
    name: 'Microsoft SharePoint',
    type: 'document-management',
    status: 'operational',
    activeUsers: 645,
    storage: {
      used: 2.8, // TB
      total: 5, // TB
    },
    files: 12580,
    collaborations: 854,
    recentActivity: 245,
  },
  {
    id: 'platform-002',
    name: 'Google Drive',
    type: 'document-management',
    status: 'operational',
    activeUsers: 385,
    storage: {
      used: 1.7, // TB
      total: 3, // TB
    },
    files: 8450,
    collaborations: 620,
    recentActivity: 185,
  },
  {
    id: 'platform-003',
    name: 'Confluence',
    type: 'wiki',
    status: 'operational',
    activeUsers: 290,
    storage: {
      used: 0.8, // TB
      total: 2, // TB
    },
    files: 2375,
    collaborations: 410,
    recentActivity: 128,
  },
  {
    id: 'platform-004',
    name: 'Notion',
    type: 'wiki-database',
    status: 'degraded',
    activeUsers: 175,
    storage: {
      used: 0.3, // TB
      total: 0.5, // TB
    },
    files: 1450,
    collaborations: 320,
    recentActivity: 95,
  },
];

// Sample document activity
const recentDocuments = [
  {
    id: 'doc-001',
    name: 'Q2 Marketing Strategy.docx',
    type: 'document',
    lastModified: new Date('2025-04-15T10:30:00'),
    modifiedBy: 'John Smith',
    platform: 'Microsoft SharePoint',
    collaborators: 8,
    version: '4.2',
  },
  {
    id: 'doc-002',
    name: 'Product Roadmap 2025.xlsx',
    type: 'spreadsheet',
    lastModified: new Date('2025-04-14T15:45:00'),
    modifiedBy: 'Emily Johnson',
    platform: 'Google Drive',
    collaborators: 12,
    version: '7.5',
  },
  {
    id: 'doc-003',
    name: 'Engineering Specs.md',
    type: 'markdown',
    lastModified: new Date('2025-04-15T09:15:00'),
    modifiedBy: 'Michael Brown',
    platform: 'Confluence',
    collaborators: 6,
    version: '2.3',
  },
  {
    id: 'doc-004',
    name: 'New Feature Mockups.png',
    type: 'image',
    lastModified: new Date('2025-04-15T14:20:00'),
    modifiedBy: 'Sarah Wilson',
    platform: 'Microsoft SharePoint',
    collaborators: 4,
    version: '1.2',
  },
  {
    id: 'doc-005',
    name: 'Team Handbook.md',
    type: 'markdown',
    lastModified: new Date('2025-04-14T11:10:00'),
    modifiedBy: 'David Lee',
    platform: 'Notion',
    collaborators: 15,
    version: '8.1',
  },
];

// Sample usage by document type data
const documentTypeData = [
  { name: 'Documents', value: 8450 },
  { name: 'Spreadsheets', value: 3280 },
  { name: 'Presentations', value: 1840 },
  { name: 'Images', value: 5120 },
  { name: 'PDFs', value: 4250 },
  { name: 'Other', value: 2485 },
];

// Sample activity over time data
const activityData = [
  { date: '2025-04-09', edits: 420, views: 1850, shares: 85 },
  { date: '2025-04-10', edits: 480, views: 2100, shares: 92 },
  { date: '2025-04-11', edits: 510, views: 2250, shares: 78 },
  { date: '2025-04-12', edits: 350, views: 1450, shares: 45 },
  { date: '2025-04-13', edits: 280, views: 1250, shares: 38 },
  { date: '2025-04-14', edits: 520, views: 2300, shares: 95 },
  { date: '2025-04-15', edits: 585, views: 2450, shares: 110 },
];

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
];

interface DocumentCollaborationProps {
  searchQuery: string;
}

export function DocumentCollaboration({
  searchQuery,
}: DocumentCollaborationProps) {
  const [timeRange, setTimeRange] = useState('7d');

  // Get document type icon
  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case 'image':
        return <FileImage className="h-4 w-4 text-amber-500" />;
      case 'markdown':
        return <File className="h-4 w-4 text-purple-500" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  // Get platform status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Operational
          </Badge>
        );
      case 'degraded':
        return (
          <Badge className="bg-amber-500">
            <Clock className="mr-1 h-3 w-3" />
            Degraded
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

  // Filter platforms based on search query
  const filteredPlatforms = collaborationPlatforms.filter(
    platform =>
      platform.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      platform.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter documents based on search query
  const filteredDocuments = recentDocuments.filter(
    doc =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.modifiedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.platform.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Document Activity</CardTitle>
              <CardDescription>Document interactions over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={activityData}
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
                      tickFormatter={value => {
                        const date = new Date(value);
                        return `${date.getMonth() + 1}/${date.getDate()}`;
                      }}
                    />
                    <YAxis
                      tick={{
                        fontSize: 12,
                        fill: 'hsl(var(--muted-foreground))',
                      }}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '0.5rem',
                        color: 'hsl(var(--foreground))',
                      }}
                      formatter={(value: number, name: string) => [value, name]}
                      labelFormatter={value => {
                        const date = new Date(value);
                        return format(date, 'MMM d, yyyy');
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="hsl(var(--chart-1))"
                      fill="hsl(var(--chart-1) / 20%)"
                      strokeWidth={2}
                      name="Views"
                    />
                    <Area
                      type="monotone"
                      dataKey="edits"
                      stroke="hsl(var(--chart-2))"
                      fill="hsl(var(--chart-2) / 20%)"
                      strokeWidth={2}
                      name="Edits"
                    />
                    <Area
                      type="monotone"
                      dataKey="shares"
                      stroke="hsl(var(--chart-3))"
                      fill="hsl(var(--chart-3) / 20%)"
                      strokeWidth={2}
                      name="Shares"
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
              <CardTitle>Document Types</CardTitle>
              <CardDescription>Distribution by file format</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[230px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={documentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {documentTypeData.map((entry) => (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={COLORS[documentTypeData.indexOf(entry) % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [value, 'Files']}
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

              <div className="grid grid-cols-2 gap-2 mt-2">
                {documentTypeData.map((type) => (
                  <div key={type.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[documentTypeData.indexOf(type) % COLORS.length] }}
                    />
                    <span className="text-sm">{type.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Document Collaboration Platforms</CardTitle>
            <CardDescription>Active document management tools</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {filteredPlatforms.map(platform => (
                <div
                  key={platform.id}
                  className="border rounded-md overflow-hidden"
                >
                  <div className="p-4 flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-md bg-muted">
                        <FileText className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">{platform.name}</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="capitalize">
                            {platform.type.replace('-', ' & ')}
                          </span>
                          <span>•</span>
                          {getStatusBadge(platform.status)}
                          <span>•</span>
                          <span>{platform.activeUsers} active users</span>
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
                          <DropdownMenuItem>View Reports</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Manage Access</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="bg-muted/50 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Storage Utilization
                          </span>
                          <span>
                            {platform.storage.used} / {platform.storage.total}{' '}
                            TB
                          </span>
                        </div>
                        <Progress
                          value={
                            (platform.storage.used / platform.storage.total) *
                            100
                          }
                          className="h-1.5"
                          indicatorClassName={
                            platform.storage.used / platform.storage.total > 0.9
                              ? 'bg-amber-500'
                              : 'bg-blue-500'
                          }
                        />
                        <div className="text-xs text-muted-foreground text-right">
                          {Math.round(
                            (platform.storage.used / platform.storage.total) *
                              100
                          )}
                          % used
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Files
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {platform.files.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Collaborations
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {platform.collaborations.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              Recent Activity
                            </span>
                          </div>
                          <span className="text-sm font-medium">
                            {platform.recentActivity.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Document Activity</CardTitle>
              <CardDescription>
                Recently modified and accessed documents
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative w-60">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search documents..."
                  className="pl-8"
                  value={searchQuery}
                />
              </div>
              <Button>
                <FilePlus2 className="mr-2 h-4 w-4" />
                New Document
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Modified By</TableHead>
                    <TableHead>Last Modified</TableHead>
                    <TableHead>Collaborators</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead className="w-[70px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDocuments.length > 0 ? (
                    filteredDocuments.map(document => (
                      <TableRow key={document.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getDocumentIcon(document.type)}
                            <span className="font-medium">{document.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{document.platform}</TableCell>
                        <TableCell>{document.modifiedBy}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>
                              {format(document.lastModified, 'MMM d, yyyy')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {format(document.lastModified, 'h:mm a')}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{document.collaborators}</span>
                          </div>
                        </TableCell>
                        <TableCell>v{document.version}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <FileText className="mr-2 h-4 w-4" />
                                Open
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share2 className="mr-2 h-4 w-4" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Link className="mr-2 h-4 w-4" />
                                Copy Link
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="mr-2 h-4 w-4" />
                                Download
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            No documents found matching your search
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
    </div>
  );
}

// Custom AlertTriangle component
function AlertTriangle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="AlertTriangle"
      aria-hidden="true"
    >
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
