'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { Folder } from '@/types/files';
import { formatDistanceToNow } from 'date-fns';
import {
  ChevronRight,
  Edit,
  Folder as FolderIcon,
  FolderOpen,
  Lock,
  MoreHorizontal,
  Share,
  Trash2,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';

interface FolderStructureProps {
  title?: string;
  folders: Folder[];
  compact?: boolean;
  onNavigateAction: (folderId: string | null) => void;
  onDeleteAction: (folderId: string) => void;
}

export function FolderStructure({
  title,
  folders,
  compact = false,
  onNavigateAction,
  onDeleteAction,
}: FolderStructureProps) {
  // Format bytes to human-readable format
  const formatBytes = (bytes: number, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`;
  };

  // Get permission badge
  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case 'private':
        return (
          <Badge variant="outline" className="text-xs">
            <Lock className="h-3 w-3 mr-1" />
            Private
          </Badge>
        );
      case 'team':
        return (
          <Badge
            variant="outline"
            className="text-xs bg-blue-500/10 text-blue-500 border-blue-500"
          >
            Team
          </Badge>
        );
      case 'department':
        return (
          <Badge
            variant="outline"
            className="text-xs bg-green-500/10 text-green-500 border-green-500"
          >
            Department
          </Badge>
        );
      case 'organization':
        return (
          <Badge
            variant="outline"
            className="text-xs bg-purple-500/10 text-purple-500 border-purple-500"
          >
            Organization
          </Badge>
        );
      default:
        return null;
    }
  };

  return compact ? (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>{title || 'Folders'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 p-4 pt-0">
        {folders.map(folder => (
          <button
            type="button"
            key={folder.id}
            className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 cursor-pointer w-full text-left"
            onClick={() => onNavigateAction(folder.id)}
          >
            <div className="flex items-center gap-2">
              <FolderIcon
                className="h-4 w-4"
                style={{ color: folder.color || 'currentColor' }}
              />
              <span className="text-sm truncate max-w-[120px]">
                {folder.name}
              </span>
            </div>
            <div className="flex items-center text-muted-foreground">
              <span className="text-xs">{folder.itemCount}</span>
              <ChevronRight className="h-4 w-4 ml-1" />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  ) : (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {folders.map(folder => (
        <button
          type="button"
          key={folder.id}
          className="rounded-md border p-3 hover:bg-muted/50 cursor-pointer transition-colors w-full text-left"
          onClick={() => onNavigateAction(folder.id)}
        >
          <div className="flex justify-between items-start mb-2">
            <div
              className="flex items-center gap-2"
              style={{ color: folder.color || 'currentColor' }}
            >
              <FolderIcon className="h-5 w-5" />
              <span className="font-medium truncate max-w-[150px]">
                {folder.name}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={e => {
                    e.stopPropagation();
                    onNavigateAction(folder.id);
                  }}
                >
                  <FolderOpen className="mr-2 h-4 w-4" />
                  Open
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => e.stopPropagation()}>
                  <Edit className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem onClick={e => e.stopPropagation()}>
                  <Share className="mr-2 h-4 w-4" />
                  Share
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={e => {
                    e.stopPropagation();
                    onDeleteAction(folder.id);
                  }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex flex-col space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>{folder.itemCount} items</span>
              <span>{formatBytes(folder.size)}</span>
            </div>
            <div className="flex justify-between">
              <span>
                Updated{' '}
                {formatDistanceToNow(folder.updatedAt, { addSuffix: true })}
              </span>
              {getPermissionBadge(folder.permissions)}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
