'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { type DocumentFormProps } from '@/types/documentation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, FileText, Paperclip, X } from 'lucide-react';
import { marked } from 'marked';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

/**
 * Form schema validation for document creation and editing
 */
const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Title must be at least 2 characters.',
  }),
  description: z.string().min(5, {
    message: 'Description must be at least 5 characters.',
  }),
  content: z.string().min(10, {
    message: 'Content must be at least 10 characters.',
  }),
  category: z.string().min(1, {
    message: 'Please select a category.',
  }),
  status: z.enum(['draft', 'published', 'archived'], {
    required_error: 'Please select a status.',
  }),
  tags: z.array(z.string()).nonempty('At least one tag is required'),
  version: z.string().optional(),
});

/**
 * Type definition for form values derived from the schema
 */
type FormValues = z.infer<typeof formSchema>;

/**
 * DocumentForm component for creating and editing documentation documents
 * @param document - Existing document to edit (optional)
 * @param onSubmitAction - Handler for form submit (Partial<Document>)
 * @param onCancelAction - Handler for cancel action
 * @param categories - List of document categories
 */
export function DocumentForm({
  document,
  onSubmitAction,
  onCancelAction,
  categories,
}: DocumentFormProps) {
  const [activeTab, setActiveTab] = useState('edit');
  const [attachments, setAttachments] = useState<
    { id: string; name: string; size: number; type: string }[]
  >(
    document?.attachments?.map(a => ({
      id: a.id,
      name: a.name,
      size: a.size,
      type: a.type,
    })) || []
  );

  // Initialize form with canonical type
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: document
      ? {
          title: document.title,
          description: document.description,
          content: document.content,
          category: document.category,
          status: document.status,
          tags: document.tags,
          version: document.version,
        }
      : {
          title: '',
          description: '',
          content: '',
          category: '',
          status: 'draft',
          tags: [],
          version: '',
        },
  });

  // Watch content for preview
  const watchContent = form.watch('content');

  /**
   * Format file size for display
   * @param bytes - File size in bytes
   * @returns Formatted size string
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1048576) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Handle attachment upload
  const handleAttachmentUpload = () => {
    // In a real app, this would open a file picker and handle upload
    const mockFile = {
      id: `file-${Date.now()}`,
      name: `attachment-${attachments.length + 1}.pdf`,
      size: Math.floor(Math.random() * 1000000) + 10000,
      type: 'application/pdf',
    };
    setAttachments([...attachments, mockFile]);
  };

  // Handle attachment removal
  const handleRemoveAttachment = (id: string) => {
    setAttachments(attachments.filter(file => file.id !== id));
  };

  /**
   * Process and render markdown to HTML
   * @returns Object with __html property containing sanitized HTML
   */
  const renderMarkdown = () => {
    try {
      const htmlContent = marked.parse(watchContent);

      if (typeof htmlContent === 'string') {
        return {
          __html: htmlContent
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/on\w+="[^"]*"/g, '')
            .replace(/on\w+='[^']*'/g, ''),
        };
      }

      return { __html: '<em>Loading preview...</em>' };
    } catch (error) {
      console.error('Error rendering markdown:', error);
      return { __html: '<em>Error rendering preview</em>' };
    }
  };

  // Handler for form submit
  const handleSubmit = (data: FormValues) => {
    onSubmitAction({
      ...data,
      tags: data.tags,
      attachments: attachments.map(att => ({
        ...att,
        url: document?.id
          ? `/api/documents/${document.id}/attachments/${att.id}`
          : `/api/documents/new/attachments/${att.id}`,
      })),
    });
  };

  return (
    <Dialog
      open={true}
      onOpenChange={open => {
        if (!open) onCancelAction();
      }}
    >
      <DialogContent className="sm:max-w-3xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {document ? 'Edit Document' : 'Create New Document'}
          </DialogTitle>
          <DialogDescription>
            Fill out the form below to{' '}
            {document ? 'update the' : 'create a new'} document.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Document title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Brief description of the document"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              <TabsContent value="edit">
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content</FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[300px] font-mono"
                          placeholder="Document content in Markdown format"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Write content using Markdown syntax.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>
              <TabsContent value="preview">
                <div className="border rounded-md p-4 min-h-[300px]">
                  {watchContent ? (
                    /* 
                      Content is sanitized in renderMarkdown() function.
                      This is a documentation editor preview that needs to render formatted content.
                      A proper sanitizer library should be used in production.
                      @see https://github.com/cure53/DOMPurify
                    */
                    <div
                      className="prose dark:prose-invert max-w-none"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: Allowed for documentation viewer
                      dangerouslySetInnerHTML={renderMarkdown()}
                    />
                  ) : (
                    <div className="text-muted-foreground italic">
                      Preview will appear here when you add content.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          value={field.value.join(', ')}
                          onChange={e =>
                            field.onChange(
                              e.target.value
                                .split(',')
                                .map(tag => tag.trim())
                                .filter(Boolean)
                            )
                          }
                          placeholder="Enter tags, separated by commas"
                        />
                      </FormControl>
                      <FormDescription>
                        Separate tags with commas.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Set status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Version</FormLabel>
                      <FormControl>
                        <Input placeholder="1.0" {...field} />
                      </FormControl>
                      <FormDescription>Optional version number</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium mb-2">Attachments</h3>
              <div className="border rounded-md p-4">
                <div className="space-y-2">
                  {attachments.map(file => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveAttachment(file.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>

                {attachments.length === 0 && (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <Paperclip className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No attachments added yet
                    </p>
                  </div>
                )}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={handleAttachmentUpload}
                >
                  <Paperclip className="h-4 w-4 mr-2" />
                  Add Attachment
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onCancelAction}>
                Cancel
              </Button>
              <Button type="submit">
                <Check className="mr-2 h-4 w-4" />
                {document ? 'Update' : 'Create'} Document
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
