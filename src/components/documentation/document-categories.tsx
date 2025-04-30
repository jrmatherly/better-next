'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import React from 'react';

interface DocumentCategoriesProps {
  categories: {
    id: string;
    name: string;
    count: number;
    icon: React.ReactNode;
  }[];
  selectedCategory: string | null;
  onSelectCategoryAction: (category: string | null) => void;
}

export function DocumentCategories({
  categories,
  selectedCategory,
  onSelectCategoryAction,
}: DocumentCategoriesProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Categories</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 p-4 pt-0">
        <button
          type="button"
          className={cn(
            'flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md',
            !selectedCategory && 'bg-muted'
          )}
          onClick={() => onSelectCategoryAction(null)}
        >
          <span className="text-sm font-medium">All Categories</span>
          <span className="text-sm text-muted-foreground">
            {categories.reduce((sum, cat) => sum + cat.count, 0)}
          </span>
        </button>
        {categories.map(category => (
          <button
            key={category.id}
            type="button"
            className={cn(
              'flex items-center justify-between cursor-pointer hover:bg-muted/50 p-2 rounded-md',
              selectedCategory === category.id && 'bg-muted'
            )}
            onClick={() =>
              onSelectCategoryAction(
                category.id === selectedCategory ? null : category.id
              )
            }
          >
            <div className="flex items-center gap-2">
              {category.icon}
              <span className="text-sm font-medium">{category.name}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {category.count}
            </span>
          </button>
        ))}
      </CardContent>
    </Card>
  );
}
