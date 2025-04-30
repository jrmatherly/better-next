'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FileText, Filter, Tag, X } from 'lucide-react';
import React from 'react';

interface DocumentSearchFiltersProps {
  categories: {
    id: string;
    name: string;
    count: number;
    icon: React.ReactNode;
  }[];
  tags: string[];
  selectedCategory: string | null;
  selectedTag: string | null;
  onSelectCategoryAction: (category: string | null) => void;
  onSelectTagAction: (tag: string | null) => void;
  onClearFiltersAction: () => void;
}

export function DocumentSearchFilters({
  categories,
  tags,
  selectedCategory,
  selectedTag,
  onSelectCategoryAction,
  onSelectTagAction,
  onClearFiltersAction,
}: DocumentSearchFiltersProps) {
  // Get active filters count
  const activeFilterCount = [
    selectedCategory !== null,
    selectedTag !== null,
  ].filter(Boolean).length;

  return (
    <div className="flex items-center gap-2">
      {selectedCategory && (
        <Badge variant="outline" className="flex items-center gap-1">
          Category: {categories.find(c => c.id === selectedCategory)?.name}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={() => onSelectCategoryAction(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      {selectedTag && (
        <Badge variant="outline" className="flex items-center gap-1">
          Tag: {selectedTag}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={() => onSelectTagAction(null)}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center rounded-full">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter Documents</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Category</span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent>
                  <DropdownMenuItem
                    onClick={() => onSelectCategoryAction(null)}
                    className={!selectedCategory ? 'bg-muted' : ''}
                  >
                    <span>All Categories</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {categories.map(category => (
                    <DropdownMenuItem
                      key={category.id}
                      onClick={() => onSelectCategoryAction(category.id)}
                      className={
                        selectedCategory === category.id ? 'bg-muted' : ''
                      }
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          {category.icon}
                          <span>{category.name}</span>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {category.count}
                        </Badge>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>

            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <div className="flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  <span>Tags</span>
                </div>
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                  <DropdownMenuItem
                    onClick={() => onSelectTagAction(null)}
                    className={!selectedTag ? 'bg-muted' : ''}
                  >
                    <span>All Tags</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {tags.map(tag => (
                    <DropdownMenuItem
                      key={tag}
                      onClick={() => onSelectTagAction(tag)}
                      className={selectedTag === tag ? 'bg-muted' : ''}
                    >
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        <span>{tag}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={onClearFiltersAction}
            disabled={!selectedCategory && !selectedTag}
          >
            <X className="mr-2 h-4 w-4" />
            Clear All Filters
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
