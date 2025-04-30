'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Database,
  FileText,
  HardDrive,
  LifeBuoy,
  Network,
  PlusCircle,
  UserPlus,
} from 'lucide-react';

export function QuickActionsWidget() {
  const quickActions = [
    {
      name: 'Create VM',
      icon: <HardDrive className="h-4 w-4" />,
      href: '/resources/create?type=vm',
    },
    {
      name: 'Create Database',
      icon: <Database className="h-4 w-4" />,
      href: '/resources/create?type=database',
    },
    {
      name: 'Network Config',
      icon: <Network className="h-4 w-4" />,
      href: '/resources/network',
    },
    {
      name: 'Invite User',
      icon: <UserPlus className="h-4 w-4" />,
      href: '/teams/invite',
    },
    {
      name: 'Add Document',
      icon: <FileText className="h-4 w-4" />,
      href: '/documentation/create',
    },
    {
      name: 'Get Support',
      icon: <LifeBuoy className="h-4 w-4" />,
      href: '/support',
    },
  ];

  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {quickActions.map(action => (
            <Button
              key={action.name}
              variant="outline"
              className="justify-start h-auto py-3"
              asChild
            >
              <a href={action.href}>
                <div className="mr-2 rounded-full bg-primary/10 p-1">
                  {action.icon}
                </div>
                <span className="ml-1">{action.name}</span>
              </a>
            </Button>
          ))}
        </div>
        <Button variant="default" className="w-full mt-4">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create New Resource
        </Button>
      </CardContent>
    </Card>
  );
}
