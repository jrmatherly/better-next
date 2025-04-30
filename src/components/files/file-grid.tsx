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
import { getInitials } from '@/lib/utils';
import type { FileItem } from '@/types/files';
import {
  Download,
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
  Pencil,
  Share,
  Star,
  StarOff,
  Trash2,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';

interface FileGridProps {
  files: FileItem[];
  onViewAction: (file: FileItem) => void;
  onToggleStarAction: (file: FileItem) => void;
  onDeleteAction: (file: FileItem) => void;
}

export function FileGrid({
  files,
  onViewAction,
  onToggleStarAction,
  onDeleteAction,
}: FileGridProps) {
  // Get file icon based on file type
  const getFileIcon = (file: FileItem, large = false) => {
    const iconSize = large ? 'h-10 w-10' : 'h-4 w-4';
    const iconClasses = large ? `${iconSize} mb-2` : iconSize;

    switch (file.type) {
      case 'document':
        return <FileText className={`${iconClasses} text-blue-500`} />;
      case 'image':
        return <FileImage className={`${iconClasses} text-green-500`} />;
      case 'video':
        return <FileVideo className={`${iconClasses} text-red-500`} />;
      case 'audio':
        return <FileAudio className={`${iconClasses} text-purple-500`} />;
      case 'code':
        return <FileCode className={`${iconClasses} text-yellow-500`} />;
      case 'pdf':
        return <FilePdf className={`${iconClasses} text-red-500`} />;
      case 'archive':
        return <FileArchive className={`${iconClasses} text-orange-500`} />;
      case 'spreadsheet':
        return <FileSpreadsheet className={`${iconClasses} text-green-500`} />;
      case 'presentation':
        return <FilePieChart className={`${iconClasses} text-orange-500`} />;
      default:
        return <FileText className={`${iconClasses} text-muted-foreground`} />;
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

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {files.map(file => (
        <button
          key={file.id}
          type="button"
          className="rounded-md border p-3 hover:bg-muted/50 cursor-pointer transition-colors relative group w-full text-left"
          onClick={() => onViewAction(file)}
        >
          {file.starred && (
            <div className="absolute top-2 right-2">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            </div>
          )}

          {/* Thumbnail for images and videos */}
          {(file.type === 'image' || file.type === 'video') &&
          file.thumbnail ? (
            <div className="w-full aspect-square rounded-md bg-muted mb-2 overflow-hidden">
              <img
                src={file.thumbnail}
                alt={file.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full aspect-square rounded-md bg-muted/50 mb-2 flex items-center justify-center">
              {getFileIcon(file, true)}
            </div>
          )}

          <div>
            <h3 className="font-medium text-sm truncate" title={file.name}>
              {file.name}
            </h3>

            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-muted-foreground">
                {formatBytes(file.size)}
              </span>
              {file.isLocked && (
                <Badge
                  variant="outline"
                  className="text-xs bg-red-500/10 text-red-500 border-red-500"
                >
                  <Lock className="h-3 w-3" />
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between mt-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={file.owner.avatar} alt={file.owner.name} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(file.owner.name)}
                </AvatarFallback>
              </Avatar>

              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={e => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
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
                    <Download className="mr-2 h-4 w-4" />
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
                  <DropdownMenuItem onClick={e => e.stopPropagation()}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
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
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
