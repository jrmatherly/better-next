'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

import type { DocumentListProps } from '@/types/documentation';

import {
  BookmarkIcon,
  CheckCircle,
  Eye,
  FileText,
  MoreHorizontal,
  Pencil,
  Trash2,
} from 'lucide-react';

export function DocumentList({
  documents,
  onViewAction,
  onEditAction,
  onDeleteAction,
  searchQuery,
  selectedCategory,
  selectedTag,
  resetFilters,
}: DocumentListProps) {
  // Get status badge based on document status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return (
          <Badge variant="default">
            <CheckCircle className="mr-1 h-3 w-3" />
            Published
          </Badge>
        );
      case 'draft':
        return (
          <Badge variant="secondary">
            <Pencil className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        );
      case 'archived':
        return (
          <Badge variant="destructive">
            <BookmarkIcon className="mr-1 h-3 w-3" />
            Archived
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div>
      {documents.length > 0 ? (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30px]" />
                <TableHead>Document</TableHead>
                <TableHead className="hidden md:table-cell">Category</TableHead>
                <TableHead className="hidden lg:table-cell">Author</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden lg:table-cell">Updated</TableHead>
                <TableHead className="w-[60px]" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {documents.map(document => (
                <TableRow key={document.id} className="hover:bg-muted/50">
                  <TableCell colSpan={7}>
                    <button
                      type="button"
                      className="w-full h-full text-left px-2 py-1 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary rounded-md"
                      onClick={() => onViewAction(document)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onViewAction(document);
                        }
                      }}
                    >
                      <div className="flex items-start">
                        <div className="flex gap-2 items-start">
                          <div className="pt-0.5">
                            <FileText className="h-4 w-4 text-blue-500" />
                          </div>
                          <div>
                            <div className="font-medium">{document.title}</div>
                            <div className="text-xs text-muted-foreground hidden sm:block">
                              {document.description.length > 60
                                ? `${document.description.substring(0, 60)}...`
                                : document.description}
                            </div>
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {document.tags.map(tag => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className="text-xs px-1 py-0 h-5"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end ml-auto">
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={e => e.stopPropagation()}
                            >
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  onViewAction(document);
                                }}
                              >
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  onEditAction(document);
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={e => {
                                  e.stopPropagation();
                                  onDeleteAction(document);
                                }}
                                className="text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No documents found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-2">
            {searchQuery || selectedCategory || selectedTag ? (
              <>
                No documents match the current filters.{' '}
                <Button
                  variant="link"
                  className="h-auto p-0"
                  onClick={resetFilters}
                >
                  Clear filters
                </Button>
              </>
            ) : (
              "You haven't created any documents yet. Create your first document to get started."
            )}
          </p>
        </div>
      )}
    </div>
  );
}
