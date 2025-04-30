'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getInitials } from '@/lib/utils';
import type { DocumentDetailsProps } from '@/types/documentation';
import { format } from 'date-fns';
import { Pencil, Trash2 } from 'lucide-react';
import { marked } from 'marked'; // marked provides its own types
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';

export function DocumentDetails({
  document,
  onCloseAction,
  onEditAction,
  onDeleteAction,
}: DocumentDetailsProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  // Get status badge based on document status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge variant="default">Published</Badge>;
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>;
      case 'archived':
        return <Badge variant="destructive">Archived</Badge>;
      default:
        return null;
    }
  };

  // Process markdown to HTML (with basic safety measures)
  const renderMarkdown = () => {
    try {
      // Convert markdown to HTML (handle both sync and async return types)
      const htmlContent = marked.parse(document.content);

      // Wait for Promise if needed, otherwise use string directly
      const processHtml = (html: string) => {
        // Basic sanitization to help mitigate XSS risks
        // For production, consider a dedicated HTML sanitizer library
        return html
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/on\w+="[^"]*"/g, '')
          .replace(/on\w+='[^']*'/g, '');
      };

      // Handle both string and Promise<string> return types
      if (typeof htmlContent === 'string') {
        return { __html: processHtml(htmlContent) };
      }

      // For async marked implementations, fallback to a simpler rendering
      // In production, you would want to properly handle the Promise
      return { __html: '<div>Loading content...</div>' };
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return { __html: 'Error rendering content' };
    }
  };

  // TODO: Fetch author details by document.authorId for avatar and name

  return (
    <Card>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar>
              {/* TODO: Display author avatar using authorId */}
              <AvatarFallback>{getInitials(document.authorId)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">
                {/* TODO: Display author name using authorId */}
                Author
              </div>
              <div className="text-xs text-muted-foreground">
                {format(document.createdAt, 'PPpp')}
              </div>
            </div>
          </div>
          {getStatusBadge(document.status)}
        </div>
      </div>
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2">{document.title}</h2>
        <div className="mb-2 text-muted-foreground">{document.description}</div>
        <div className="mb-4">
          {document.tags.map(tag => (
            <Badge key={tag} className="mr-1" variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
          </TabsList>
          <TabsContent value="content">
            {/* 
              Content is sanitized in renderMarkdown() function.
              This is a documentation viewer that needs to render formatted content.
              A proper sanitizer library should be used in production.
              @see https://github.com/cure53/DOMPurify
            */}
            <div
              className="prose dark:prose-invert max-w-none"
              // biome-ignore lint/security/noDangerouslySetInnerHtml: Allowed for documentation viewer
              dangerouslySetInnerHTML={renderMarkdown()}
            />
          </TabsContent>
          <TabsContent value="attachments">
            <ul>
              {document.attachments.map(att => (
                <li key={att.id} className="mb-2">
                  <a href={att.url} target="_blank" rel="noopener noreferrer">
                    {att.name} ({att.size} bytes)
                  </a>
                </li>
              ))}
            </ul>
          </TabsContent>
        </Tabs>
        <div className="text-xs text-muted-foreground">
          Last updated: {format(document.updatedAt, 'PPpp')}
        </div>
      </div>
      <div className="p-4 border-t flex justify-end gap-2">
        <Button variant="outline" onClick={onCloseAction}>
          Close
        </Button>
        <Button variant="secondary" onClick={() => onEditAction(document)}>
          <Pencil className="w-4 h-4 mr-1" /> Edit
        </Button>
        <Button variant="destructive" onClick={() => setConfirmDelete(true)}>
          <Trash2 className="w-4 h-4 mr-1" /> Delete
        </Button>
      </div>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this document? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDeleteAction(document);
                setConfirmDelete(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
