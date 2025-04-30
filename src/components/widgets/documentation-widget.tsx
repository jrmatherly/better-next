'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { BookOpen, Code, FileText, Search } from 'lucide-react';

// Mock data - in a real app, this would come from an API
const recentDocs = [
  {
    title: 'VM Migration Guide',
    category: 'Guides',
    icon: <BookOpen className="h-4 w-4" />,
    href: '/documentation/vm-migration-guide',
    updated: '3d ago',
  },
  {
    title: 'API Authentication',
    category: 'API',
    icon: <Code className="h-4 w-4" />,
    href: '/documentation/api-authentication',
    updated: '1w ago',
  },
  {
    title: 'Database Backup Procedure',
    category: 'Guides',
    icon: <FileText className="h-4 w-4" />,
    href: '/documentation/database-backup-procedure',
    updated: '2w ago',
  },
];

export function DocumentationWidget() {
  return (
    <Card className="h-full w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium">Documentation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search documentation..." className="pl-8" />
        </div>
        <div className="space-y-2">
          {recentDocs.map(doc => (
            <a
              key={doc.title}
              href={doc.href}
              className="flex items-center justify-between p-2 rounded-md hover:bg-accent group"
            >
              <div className="flex items-center">
                <div className="rounded-full bg-primary/10 p-1.5 mr-3">
                  {doc.icon}
                </div>
                <div>
                  <p className="text-sm font-medium group-hover:text-primary transition-colors">
                    {doc.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {doc.category} • Updated {doc.updated}
                  </p>
                </div>
              </div>
            </a>
          ))}
        </div>
        <Button variant="outline" className="w-full" asChild>
          <a href="/documentation">
            <BookOpen className="h-4 w-4 mr-2" />
            Browse All Documentation
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}
