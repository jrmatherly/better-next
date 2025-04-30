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
  AlertTriangle,
  Calendar,
  CheckCircle,
  Clipboard,
  Clock,
  ListChecks,
  MoreHorizontal,
  Plus,
  Search,
  Users,
  XCircle,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';
import {
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

// Sample project management tools
const projectTools = [
  {
    id: 'tool-001',
    name: 'Jira',
    description: 'Issue & project tracking',
    status: 'operational',
    activeUsers: 245,
    activeProjects: 32,
    totalTasks: 2450,
    completedTasks: 1680,
    metrics: {
      tasksCreatedThisWeek: 145,
      tasksCompletedThisWeek: 128,
      activeIssues: 345,
      upcomingDeadlines: 28,
    },
  },
  {
    id: 'tool-002',
    name: 'Asana',
    description: 'Team task management',
    status: 'operational',
    activeUsers: 180,
    activeProjects: 24,
    totalTasks: 1850,
    completedTasks: 1220,
    metrics: {
      tasksCreatedThisWeek: 110,
      tasksCompletedThisWeek: 98,
      activeIssues: 225,
      upcomingDeadlines: 18,
    },
  },
  {
    id: 'tool-003',
    name: 'Trello',
    description: 'Visual task boards',
    status: 'degraded',
    activeUsers: 135,
    activeProjects: 18,
    totalTasks: 950,
    completedTasks: 620,
    metrics: {
      tasksCreatedThisWeek: 85,
      tasksCompletedThisWeek: 72,
      activeIssues: 130,
      upcomingDeadlines: 15,
    },
  },
];

// Sample project data
const projects = [
  {
    id: 'proj-001',
    name: 'Website Redesign',
    tool: 'Jira',
    status: 'in-progress',
    progress: 68,
    dueDate: new Date('2025-05-15'),
    owner: 'Sarah Johnson',
    team: 12,
    priority: 'high',
  },
  {
    id: 'proj-002',
    name: 'Mobile App Development',
    tool: 'Jira',
    status: 'in-progress',
    progress: 42,
    dueDate: new Date('2025-07-01'),
    owner: 'Michael Brown',
    team: 8,
    priority: 'high',
  },
  {
    id: 'proj-003',
    name: 'Q2 Marketing Campaign',
    tool: 'Asana',
    status: 'in-progress',
    progress: 85,
    dueDate: new Date('2025-04-30'),
    owner: 'Emily Johnson',
    team: 6,
    priority: 'high',
  },
  {
    id: 'proj-004',
    name: 'Customer Feedback Analysis',
    tool: 'Trello',
    status: 'completed',
    progress: 100,
    dueDate: new Date('2025-04-10'),
    owner: 'David Lee',
    team: 4,
    priority: 'medium',
  },
  {
    id: 'proj-005',
    name: 'Sales Training Program',
    tool: 'Asana',
    status: 'at-risk',
    progress: 35,
    dueDate: new Date('2025-05-05'),
    owner: 'Lisa Chen',
    team: 7,
    priority: 'medium',
  },
  {
    id: 'proj-006',
    name: 'Infrastructure Upgrade',
    tool: 'Jira',
    status: 'in-progress',
    progress: 52,
    dueDate: new Date('2025-06-15'),
    owner: 'Robert Taylor',
    team: 5,
    priority: 'high',
  },
  {
    id: 'proj-007',
    name: 'New Office Setup',
    tool: 'Trello',
    status: 'not-started',
    progress: 0,
    dueDate: new Date('2025-08-01'),
    owner: 'Amanda Wilson',
    team: 3,
    priority: 'medium',
  },
];

// Sample project status data
const projectStatusData = [
  { name: 'Not Started', value: 1 },
  { name: 'In Progress', value: 4 },
  { name: 'At Risk', value: 1 },
  { name: 'Completed', value: 1 },
];

// Sample task completion data over time
const taskCompletionData = [
  { date: '2025-04-09', completed: 42 },
  { date: '2025-04-10', completed: 38 },
  { date: '2025-04-11', completed: 45 },
  { date: '2025-04-12', completed: 32 },
  { date: '2025-04-13', completed: 18 },
  { date: '2025-04-14', completed: 50 },
  { date: '2025-04-15', completed: 55 },
];

// Sample task distribution by team
const taskDistributionData = [
  { name: 'Development', tasks: 485 },
  { name: 'Marketing', tasks: 240 },
  { name: 'Design', tasks: 185 },
  { name: 'Sales', tasks: 140 },
  { name: 'Operations', tasks: 210 },
];

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884d8',
  '#82ca9d',
];

interface ProjectManagementProps {
  searchQuery: string;
}

export function ProjectManagement({ searchQuery }: ProjectManagementProps) {
  // Get project status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'not-started':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            Not Started
          </Badge>
        );
      case 'in-progress':
        return (
          <Badge className="bg-blue-500">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case 'at-risk':
        return (
          <Badge className="bg-amber-500">
            <AlertTriangle className="mr-1 h-3 w-3" />
            At Risk
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get tool status badge
  const getToolStatusBadge = (status: string) => {
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
            <AlertTriangle className="mr-1 h-3 w-3" />
            Degraded
          </Badge>
        );
      case 'outage':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Outage
          </Badge>
        );
      default:
        return null;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge
            variant="outline"
            className="bg-red-500/10 text-red-500 border-red-500"
          >
            High
          </Badge>
        );
      case 'medium':
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-500 border-amber-500"
          >
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500"
          >
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  // Filter projects based on search query
  const filteredProjects = projects.filter(
    project =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.tool.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter tools based on search query
  const filteredTools = projectTools.filter(
    tool =>
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Project Status</CardTitle>
            <CardDescription>Overview of all projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    fill="#8884d8"
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {projectStatusData.map(entry => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={
                          COLORS[
                            projectStatusData.indexOf(entry) % COLORS.length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, 'Projects']}
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
              {projectStatusData.map(status => (
                <div key={status.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        COLORS[
                          projectStatusData.indexOf(status) % COLORS.length
                        ],
                    }}
                  />
                  <div className="flex-1 flex justify-between">
                    <span className="text-sm">{status.name}</span>
                    <span className="text-sm font-medium">{status.value}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Projects</span>
                <span className="font-medium">{projects.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Task Completion</CardTitle>
            <CardDescription>Daily completed tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={taskCompletionData}
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
                    formatter={(value: number) => [value, 'Tasks Completed']}
                    labelFormatter={value => {
                      const date = new Date(value);
                      return format(date, 'MMM d, yyyy');
                    }}
                  />
                  <Bar
                    dataKey="completed"
                    fill="hsl(var(--chart-2))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t flex justify-between">
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">
                  Weekly Total
                </span>
                <span className="font-medium">280 tasks</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm text-muted-foreground">
                  Completion Rate
                </span>
                <span className="font-medium">86%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Team Workload</CardTitle>
            <CardDescription>Tasks by department</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={taskDistributionData}
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
                    width={90}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '0.5rem',
                      color: 'hsl(var(--foreground))',
                    }}
                  />
                  <Bar dataKey="tasks" fill="hsl(var(--chart-3))" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">
                  Total Active Tasks
                </span>
                <span className="font-medium">1,260</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Project Management Tools</CardTitle>
          <CardDescription>Platform usage and metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {filteredTools.map(tool => (
              <div key={tool.id} className="border rounded-md overflow-hidden">
                <div className="p-4 flex justify-between items-start">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-md bg-muted">
                      <Clipboard className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">{tool.name}</h3>
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <span>{tool.description}</span>
                        <span>•</span>
                        {getToolStatusBadge(tool.status)}
                        <span>•</span>
                        <span>{tool.activeUsers} active users</span>
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
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="flex items-center gap-1">
                          <ListChecks className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Task Completion
                          </span>
                        </div>
                        <span className="text-sm">
                          {Math.round(
                            (tool.completedTasks / tool.totalTasks) * 100
                          )}
                          %
                        </span>
                      </div>
                      <Progress
                        value={(tool.completedTasks / tool.totalTasks) * 100}
                        className="h-1.5"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Completed</span>
                        <span>
                          {tool.completedTasks} / {tool.totalTasks}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Clipboard className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Projects
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {tool.activeProjects}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Plus className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Tasks Created
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {tool.metrics.tasksCreatedThisWeek}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Tasks Completed
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {tool.metrics.tasksCompletedThisWeek}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Active Issues
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {tool.metrics.activeIssues}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Upcoming Deadlines
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {tool.metrics.upcomingDeadlines}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            Team Utilization
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {Math.round((tool.activeUsers / 800) * 100)}%
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
            <CardTitle>Active Projects</CardTitle>
            <CardDescription>
              Current projects across all platforms
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative w-60">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search projects..."
                className="pl-8"
                value={searchQuery}
              />
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Tool</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Team Size</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.length > 0 ? (
                  filteredProjects.map(project => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.name}
                      </TableCell>
                      <TableCell>{project.tool}</TableCell>
                      <TableCell>{getStatusBadge(project.status)}</TableCell>
                      <TableCell>
                        <div className="w-[100px] space-y-1">
                          <Progress
                            value={project.progress}
                            className="h-1.5"
                            indicatorClassName={
                              project.progress === 100
                                ? 'bg-green-500'
                                : project.progress >= 75
                                  ? 'bg-blue-500'
                                  : project.progress >= 50
                                    ? 'bg-amber-500'
                                    : project.progress >= 25
                                      ? 'bg-orange-500'
                                      : 'bg-red-500'
                            }
                          />
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{project.progress}%</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{project.owner}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{project.team}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{format(project.dueDate, 'MMM d, yyyy')}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date() > project.dueDate ? 'Overdue' : ''}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getPriorityBadge(project.priority)}
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
                            <DropdownMenuItem>Edit Project</DropdownMenuItem>
                            <DropdownMenuItem>View Tasks</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Manage Team</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <Clipboard className="h-8 w-8 text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">
                          No projects found matching your search
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
  );
}
