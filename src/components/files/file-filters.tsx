'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { FileType } from '@/types/files';
import {
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  File as FilePdf,
  FilePieChart,
  FileQuestion,
  FileSpreadsheet,
  FileText,
  FileVideo,
  Filter,
  X,
} from 'lucide-react';
import React from 'react';

interface FileFiltersProps {
  fileTypeFilter: FileType | null;
  onFileTypeFilterChangeAction: (fileType: FileType | null) => void;
  onClearFiltersAction: () => void;
}

export function FileFilters({
  fileTypeFilter,
  onFileTypeFilterChangeAction,
  onClearFiltersAction,
}: FileFiltersProps) {
  // Get active filters count
  const activeFilterCount = fileTypeFilter ? 1 : 0;

  // File type options
  const fileTypes: { id: FileType; name: string; icon: React.ReactNode }[] = [
    {
      id: 'document',
      name: 'Documents',
      icon: <FileText className="h-4 w-4 text-blue-500" />,
    },
    {
      id: 'image',
      name: 'Images',
      icon: <FileImage className="h-4 w-4 text-green-500" />,
    },
    {
      id: 'video',
      name: 'Videos',
      icon: <FileVideo className="h-4 w-4 text-red-500" />,
    },
    {
      id: 'audio',
      name: 'Audio',
      icon: <FileAudio className="h-4 w-4 text-purple-500" />,
    },
    {
      id: 'code',
      name: 'Code',
      icon: <FileCode className="h-4 w-4 text-yellow-500" />,
    },
    {
      id: 'pdf',
      name: 'PDFs',
      icon: <FilePdf className="h-4 w-4 text-red-500" />,
    },
    {
      id: 'archive',
      name: 'Archives',
      icon: <FileArchive className="h-4 w-4 text-orange-500" />,
    },
    {
      id: 'spreadsheet',
      name: 'Spreadsheets',
      icon: <FileSpreadsheet className="h-4 w-4 text-green-500" />,
    },
    {
      id: 'presentation',
      name: 'Presentations',
      icon: <FilePieChart className="h-4 w-4 text-orange-500" />,
    },
    {
      id: 'other',
      name: 'Other',
      icon: <FileQuestion className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="flex items-center gap-2">
      {fileTypeFilter && (
        <Badge variant="outline" className="flex items-center gap-1">
          Type: {fileTypes.find(t => t.id === fileTypeFilter)?.name}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={onClearFiltersAction}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            <span>Filter</span>
            {activeFilterCount > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter Files</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
              File Type
            </DropdownMenuLabel>

            <DropdownMenuItem
              onClick={() => onFileTypeFilterChangeAction(null)}
              className={!fileTypeFilter ? 'bg-muted' : ''}
            >
              <span>All File Types</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {fileTypes.map(type => (
              <DropdownMenuItem
                key={type.id}
                onClick={() => onFileTypeFilterChangeAction(type.id)}
                className={fileTypeFilter === type.id ? 'bg-muted' : ''}
              >
                <div className="flex items-center gap-2">
                  {type.icon}
                  <span>{type.name}</span>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onClearFiltersAction}
            disabled={!fileTypeFilter}
          >
            <X className="mr-2 h-4 w-4" />
            Clear Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
