"use client"

import React from 'react';
import { FileText, FileCode, Users, Database, Film, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface DocumentationItem {
  id: string;
  title: string;
  category: 'guide' | 'api' | 'training' | 'reference' | 'tutorial';
  updatedAt: string;
  author: string;
  views: number;
  icon: React.ReactNode;
}

const documents: DocumentationItem[] = [
  {
    id: 'doc-1',
    title: 'Resource Allocation Guidelines',
    category: 'guide',
    updatedAt: '2d ago',
    author: 'Admin Team',
    views: 245,
    icon: <FileText className="h-5 w-5 text-blue-400" />,
  },
  {
    id: 'doc-2',
    title: 'API Documentation',
    category: 'api',
    updatedAt: '1w ago',
    author: 'Developer Team',
    views: 189,
    icon: <FileCode className="h-5 w-5 text-violet-400" />,
  },
  {
    id: 'doc-3',
    title: 'VMware Provisioning Tutorial',
    category: 'tutorial',
    updatedAt: '3d ago',
    author: 'Operations',
    views: 327,
    icon: <Film className="h-5 w-5 text-green-400" />,
  },
  {
    id: 'doc-4',
    title: 'User Management Guide',
    category: 'guide',
    updatedAt: '5d ago',
    author: 'Admin Team',
    views: 156,
    icon: <Users className="h-5 w-5 text-orange-400" />,
  },
  {
    id: 'doc-5',
    title: 'Database Schema Reference',
    category: 'reference',
    updatedAt: '1d ago',
    author: 'Database Team',
    views: 210,
    icon: <Database className="h-5 w-5 text-red-400" />,
  },
];

export function DocumentationWidget() {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium">Recent Updates</h3>
        <button className="text-xs text-primary">View Library</button>
      </div>
      
      <ScrollArea className="h-[220px]">
        <div className="space-y-2">
          {documents.map((doc) => (
            <div 
              key={doc.id} 
              className="flex items-center p-2 rounded-md hover:bg-muted/50 transition-colors"
            >
              <div className="mr-3 flex-shrink-0">
                {doc.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-sm font-medium truncate">{doc.title}</h4>
                  <Download className="h-3.5 w-3.5 text-muted-foreground ml-2 flex-shrink-0" />
                </div>
                <div className="flex text-xs text-muted-foreground">
                  <span className="truncate">{doc.author}</span>
                  <span className="mx-1 flex-shrink-0">•</span>
                  <span className="flex-shrink-0">{doc.updatedAt}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}