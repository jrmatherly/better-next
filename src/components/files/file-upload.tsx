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
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/providers/auth-provider';
import type { FileItem, FileType } from '@/types/files';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Info, Plus, Upload, X } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Form schema
const formSchema = z.object({
  files: z.any(),
  description: z.string().optional(),
  tags: z.array(z.string()),
  permissions: z.enum([
    'private',
    'team',
    'department',
    'organization',
    'public',
  ]),
});

type FormValues = z.infer<typeof formSchema>;

interface FileUploadProps {
  currentFolderId: string | null;
  onUploadAction: (file: FileItem) => void;
  onCancelAction: () => void;
}

export function FileUpload({
  currentFolderId,
  onUploadAction,
  onCancelAction,
}: FileUploadProps) {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Form definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      tags: [],
      permissions: 'private',
    },
  });

  // Handle file input change
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFiles(Array.from(files));
    }
  };

  // Remove a file from the list
  const handleRemoveFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  // Determine file type based on mime type
  const getFileType = (file: File): FileType => {
    const mimeType = file.type;

    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType === 'application/pdf') return 'pdf';
    if (
      mimeType.includes('spreadsheet') ||
      mimeType === 'application/vnd.ms-excel'
    )
      return 'spreadsheet';
    if (
      mimeType.includes('presentation') ||
      mimeType === 'application/vnd.ms-powerpoint'
    )
      return 'presentation';
    if (
      mimeType.includes('archive') ||
      mimeType.includes('zip') ||
      mimeType.includes('compressed')
    )
      return 'archive';
    if (mimeType.includes('text/')) return 'document';
    // Add more specific mime type checks as needed

    // Check file extension for types that might not have specific mime types
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    if (
      [
        'js',
        'ts',
        'py',
        'java',
        'c',
        'cpp',
        'cs',
        'go',
        'rb',
        'php',
        'html',
        'css',
        'json',
        'xml',
      ].includes(extension)
    ) {
      return 'code';
    }

    return 'document';
  };

  // Get file icon
  const getFileIcon = (file: File) => {
    const fileType = getFileType(file);

    switch (fileType) {
      case 'document':
        return <FileText className="h-6 w-6 text-blue-500" />;
      case 'image':
        return <FileImage className="h-6 w-6 text-green-500" />;
      case 'video':
        return <FileVideo className="h-6 w-6 text-red-500" />;
      case 'audio':
        return <FileAudio className="h-6 w-6 text-purple-500" />;
      case 'code':
        return <FileCode className="h-6 w-6 text-yellow-500" />;
      case 'pdf':
        return <FilePdf className="h-6 w-6 text-red-500" />;
      case 'archive':
        return <FileArchive className="h-6 w-6 text-orange-500" />;
      case 'spreadsheet':
        return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
      case 'presentation':
        return <FilePieChart className="h-6 w-6 text-orange-500" />;
      default:
        return <FileText className="h-6 w-6 text-muted-foreground" />;
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

  // Handle form submission
  const onSubmit = async (values: FormValues) => {
    if (uploadedFiles.length === 0) return;

    setUploading(true);

    try {
      // Simulate upload progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += 5;
        setUploadProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);

          // Create a new file item
          const file = uploadedFiles[0];
          if (!file) {
            setUploading(false);
            return;
          }
          const fileType = getFileType(file);
          const extension = file.name.split('.').pop() || '';

          const newFile: FileItem = {
            id: `file-${Date.now().toString(36)}`,
            name: file.name,
            type: fileType,
            mimeType: file.type,
            extension: extension,
            size: file.size,
            createdAt: new Date(),
            updatedAt: new Date(),
            folderId: currentFolderId,
            path: [], // In a real app, this would be populated correctly
            owner: {
              id: user?.id || '',
              name: user?.name || '',
            },
            permissions: values.permissions,
            tags: values.tags,
            starred: false,
            description: values.description,
            url: '#', // In a real app, this would be the actual URL
            versions: [
              {
                id: `version-${Date.now().toString(36)}`,
                versionNumber: '1.0',
                uploadedBy: {
                  id: user?.id || '',
                  name: user?.name || '',
                },
                uploadedAt: new Date(),
                fileSize: file.size,
                comment: 'Initial version',
              },
            ],
            comments: [],
            isShared: values.permissions !== 'private',
            isLocked: false,
          };

          // In a real app, we would upload the file to a server

          // Call the onUpload callback
          onUploadAction(newFile);
        }
      }, 100);
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={open => !open && onCancelAction()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Files</DialogTitle>
          <DialogDescription>
            Upload files to{' '}
            {currentFolderId ? 'the current folder' : 'your file repository'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {uploadedFiles.length === 0 ? (
              <button
                type="button"
                tabIndex={0}
                className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => document.getElementById('file-upload')?.click()}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    document.getElementById('file-upload')?.click();
                  }
                }}
                aria-label="Open file picker"
              >
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  onChange={handleFileInputChange}
                  multiple
                />
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">
                  Click to upload or drag and drop
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Upload files up to 100MB each
                </p>
              </button>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Selected Files</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      document.getElementById('file-upload')?.click()
                    }
                  >
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      onChange={handleFileInputChange}
                      multiple
                    />
                    <Plus className="h-4 w-4 mr-1" />
                    Add More Files
                  </Button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {uploadedFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${file.size}`}
                      className="flex items-start justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-start gap-3">
                        {getFileIcon(file)}
                        <div>
                          <p
                            className="text-sm font-medium line-clamp-1"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatBytes(file.size)}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => handleRemoveFile(idx)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a description for this file"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="project, documentation, design"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-xs">
                      Separate multiple tags with commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="permissions"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Permissions</FormLabel>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent className="w-80">
                            <div className="space-y-2">
                              <p>
                                <strong>Private</strong>: Only you can access
                              </p>
                              <p>
                                <strong>Team</strong>: All team members can
                                access
                              </p>
                              <p>
                                <strong>Department</strong>: Your department can
                                access
                              </p>
                              <p>
                                <strong>Organization</strong>: Everyone in your
                                org can access
                              </p>
                              <p>
                                <strong>Public</strong>: Anyone with the link
                                can access
                              </p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select permissions" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="private">
                          <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4" />
                            <span>Private</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="team">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>Team</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="department">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            <span>Department</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="organization">
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>Organization</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="public">
                          <div className="flex items-center gap-2">
                            <Globe className="h-4 w-4" />
                            <span>Public</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Uploading...</span>
                  <span className="text-sm">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onCancelAction}
                disabled={uploading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={uploadedFiles.length === 0 || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// Custom icon components to avoid importing all lucide icons
function Lock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="Lock"
      aria-hidden="true"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function Users(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="Users"
      aria-hidden="true"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function Building(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="Building"
      aria-hidden="true"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
      <path d="M9 22v-4h6v4" />
      <path d="M8 6h.01" />
      <path d="M16 6h.01" />
      <path d="M12 6h.01" />
      <path d="M12 10h.01" />
      <path d="M12 14h.01" />
      <path d="M16 10h.01" />
      <path d="M16 14h.01" />
      <path d="M8 10h.01" />
      <path d="M8 14h.01" />
    </svg>
  );
}

function Building2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="Building2"
      aria-hidden="true"
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" />
      <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" />
      <path d="M10 6h4" />
      <path d="M10 10h4" />
      <path d="M10 14h4" />
      <path d="M10 18h4" />
    </svg>
  );
}

function Globe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="Globe"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" x2="22" y1="12" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function Loader2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="Loader2"
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function FileImage(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="FileImage"
      aria-hidden="true"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <circle cx="10" cy="13" r="2" />
      <path d="M20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22" />
    </svg>
  );
}

function FileVideo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="FileVideo"
      aria-hidden="true"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 11 5 3-5 3v-6z" />
    </svg>
  );
}

function FileAudio(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="FileAudio"
      aria-hidden="true"
    >
      <path d="M17.5 22h.5c.5 0 1-.2 1.4-.6.4-.4.6-.9.6-1.4V7.5L14.5 2H6c-.5 0-1 .2-1.4.6C4.2 3 4 3.5 4 4v3" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M10 20v-5" />
      <path d="M6 20v-2" />
      <path d="M14 20v-4" />
      <path d="M10 15c-2.2 0-4-1.8-4-4 0-1.5 0.8-2.8 2-3.4" />
      <path d="M2 18c0-4.4 3.6-8 8-8 .9 0 1.8.2 2.6.5" />
    </svg>
  );
}

function FileCode(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="FileCode"
      aria-hidden="true"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="m10 13-2 2 2 2" />
      <path d="m14 17 2-2-2-2" />
    </svg>
  );
}

function FilePdf(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="FilePdf"
      aria-hidden="true"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M9.5 15h.01" />
      <path d="M9.5 12h.01" />
      <path d="M14.5 15h.01" />
      <path d="M14.5 12h.01" />
    </svg>
  );
}

function FileArchive(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="FileArchive"
      aria-hidden="true"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <rect width="8" height="8" x="8" y="12" rx="1" />
    </svg>
  );
}

function FileSpreadsheet(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="FileSpreadsheet"
      aria-hidden="true"
    >
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M8 13h2" />
      <path d="M8 17h2" />
      <path d="M14 13h2" />
      <path d="M14 17h2" />
    </svg>
  );
}

function FilePieChart(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
      aria-label="FilePieChart"
      aria-hidden="true"
    >
      <path d="M16 22h2a2 2 0 0 0 2-2V7l-5-5H8a2 2 0 0 0-2 2v3" />
      <polyline points="14 2 14 8 20 8" />
      <path d="M4.04 11.71a5.84 5.84 0 1 0 8.2 8.29" />
      <path d="M13.83 16A5.83 5.83 0 0 0 8 10.17V16h5.83Z" />
    </svg>
  );
}
