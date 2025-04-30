'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

// Mock data - in a real app, this would come from an API
const teamUpdates = [
  {
    id: 'update-1',
    user: {
      name: 'Alex Kim',
      avatar: 'https://i.pravatar.cc/150?u=alex',
      initials: 'AK',
    },
    action: 'created',
    resource: 'Virtual Machine web-server-01',
    team: 'Workload Hosting',
    timestamp: '2h ago',
  },
  {
    id: 'update-2',
    user: {
      name: 'Jamie Smith',
      avatar: 'https://i.pravatar.cc/150?u=jamie',
      initials: 'JS',
    },
    action: 'updated',
    resource: 'Documentation on deployment procedures',
    team: 'Field Technology',
    timestamp: '4h ago',
  },
  {
    id: 'update-3',
    user: {
      name: 'Taylor Johnson',
      avatar: 'https://i.pravatar.cc/150?u=taylor',
      initials: 'TJ',
    },
    action: 'requested',
    resource: 'Access to production database',
    team: 'Endpoint Technology',
    timestamp: 'Yesterday',
  },
  {
    id: 'update-4',
    user: {
      name: 'Jordan Lee',
      avatar: 'https://i.pravatar.cc/150?u=jordan',
      initials: 'JL',
    },
    action: 'deployed',
    resource: 'New collaboration tools',
    team: 'Collaboration Services',
    timestamp: '2d ago',
  },
];

export function TeamUpdatesWidget() {
  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Team Updates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {teamUpdates.map(update => (
            <div
              key={update.id}
              className="flex items-start space-x-4 p-2 rounded-md hover:bg-accent transition-colors cursor-pointer"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={update.user.avatar} alt={update.user.name} />
                <AvatarFallback>{update.user.initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">{update.user.name}</span>{' '}
                  <span className="text-muted-foreground">{update.action}</span>{' '}
                  <span className="font-medium">{update.resource}</span>
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <span>{update.team}</span>
                  <span className="mx-1">•</span>
                  <span>{update.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="outline" className="w-full mt-4" asChild>
          <a href="/teams/activity">
            <Bell className="h-4 w-4 mr-2" />
            View All Team Activity
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
