'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getInitials } from '@/lib/utils';
import type { FileItem, FilesSortOptions } from '@/types/files';
import { formatDistanceToNow } from 'date-fns';
import {
  ArrowUpDown,
  Clock,
  DownloadCloud,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  File as FilePdf,
  FilePieChart,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Lock,
  MoreHorizontal,
  Share,
  Star,
  StarOff,
  Trash2,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';

interface FileListProps {
  files: FileItem[];
  onViewAction: (file: FileItem) => void;
  onToggleStarAction: (file: FileItem) => void;
  onDeleteAction: (file: FileItem) => void;
  onSortAction: (option: FilesSortOptions) => void;
  sortOption: FilesSortOptions;
}

export function FileList({
  files,
  onViewAction,
  onToggleStarAction,
  onDeleteAction,
  onSortAction,
  sortOption,
}: FileListProps) {
  // Get file icon based on file type
  const getFileIcon = (file: FileItem) => {
    switch (file.type) {
      case 'document':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'image':
        return <FileImage className="h-4 w-4 text-green-500" />;
      case 'video':
        return <FileVideo className="h-4 w-4 text-red-500" />;
      case 'audio':
        return <FileAudio className="h-4 w-4 text-purple-500" />;
      case 'code':
        return <FileCode className="h-4 w-4 text-yellow-500" />;
      case 'pdf':
        return <FilePdf className="h-4 w-4 text-red-500" />;
      case 'archive':
        return <FileArchive className="h-4 w-4 text-orange-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case 'presentation':
        return <FilePieChart className="h-4 w-4 text-orange-500" />;
      default:
        return <FileText className="h-4 w-4 text-muted-foreground" />;
    }
  };

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
          <Badge variant="outline" className="gap-1 text-xs">
            <Lock className="h-3 w-3" />
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
      case 'public':
        return (
          <Badge
            variant="outline"
            className="text-xs bg-orange-500/10 text-orange-500 border-orange-500"
          >
            Public
          </Badge>
        );
      default:
        return null;
    }
  };

  // Handle sort
  const handleSort = (field: FilesSortOptions['field']) => {
    onSortAction({
      field,
      direction:
        sortOption.field === field && sortOption.direction === 'asc'
          ? 'desc'
          : 'asc',
    });
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px]" />
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('name')}>
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">
              <Button variant="ghost" onClick={() => handleSort('type')}>
                Type
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden md:table-cell">Owner</TableHead>
            <TableHead className="hidden lg:table-cell">
              <Button variant="ghost" onClick={() => handleSort('updatedAt')}>
                Modified
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="hidden lg:table-cell">
              <Button variant="ghost" onClick={() => handleSort('size')}>
                Size
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead className="w-[70px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.map(file => (
            <TableRow
              key={file.id}
              onClick={() => onViewAction(file)}
              className="cursor-pointer"
            >
              <TableCell className="pr-0 w-[40px]">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground"
                  onClick={e => {
                    e.stopPropagation();
                    onToggleStarAction(file);
                  }}
                >
                  {file.starred ? (
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getFileIcon(file)}
                  <div>
                    <p className="font-medium">{file.name}</p>
                    <div className="flex items-center gap-2 md:hidden">
                      <span className="text-xs text-muted-foreground capitalize">
                        {file.type}
                      </span>
                      {file.isLocked && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-red-500/10 text-red-500 border-red-500"
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell capitalize">
                {file.type}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage
                      src={file.owner.avatar}
                      alt={file.owner.name}
                    />
                    <AvatarFallback>
                      {getInitials(file.owner.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{file.owner.name}</span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                <div className="flex items-center">
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  <span className="text-xs">
                    {formatDistanceToNow(file.updatedAt, { addSuffix: true })}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden lg:table-cell text-muted-foreground">
                <span className="text-xs">{formatBytes(file.size)}</span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    asChild
                    onClick={e => e.stopPropagation()}
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        onViewAction(file);
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={e => e.stopPropagation()}>
                      <DownloadCloud className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={e => {
                        e.stopPropagation();
                        onToggleStarAction(file);
                      }}
                    >
                      {file.starred ? (
                        <>
                          <StarOff className="mr-2 h-4 w-4" />
                          Remove Star
                        </>
                      ) : (
                        <>
                          <Star className="mr-2 h-4 w-4" />
                          Star
                        </>
                      )}
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
                        onDeleteAction(file);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
