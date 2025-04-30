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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { logger } from '@/lib/logger';
import { getInitials } from '@/lib/utils';
import type { FileItem, FileType } from '@/types/files';
import { format } from 'date-fns';
import {
  ArrowLeft,
  Calendar,
  Download,
  Eye,
  FileArchive,
  FileAudio,
  FileCode,
  FileImage,
  File as FilePdf,
  FilePieChart,
  FileSpreadsheet,
  FileText,
  FileVideo,
  History,
  Lock,
  MoreHorizontal,
  Plus,
  Send,
  Share2,
  Star,
  StarOff,
  Tag,
  Trash2,
  Upload,
} from 'lucide-react';
import React, { useState } from 'react';

interface FileDetailsProps {
  file: FileItem;
  onCloseAction: () => void;
  onDeleteAction: (fileId: string) => void;
  onToggleStarAction: (fileId: string) => void;
}

export function FileDetails({
  file,
  onCloseAction,
  onDeleteAction,
  onToggleStarAction,
}: FileDetailsProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('details');

  // Get file icon based on file type
  const getFileIcon = (type: FileType, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-16 w-16',
    };

    switch (type) {
      case 'document':
        return <FileText className={`${sizeClasses[size]} text-blue-500`} />;
      case 'image':
        return <FileImage className={`${sizeClasses[size]} text-green-500`} />;
      case 'video':
        return <FileVideo className={`${sizeClasses[size]} text-red-500`} />;
      case 'audio':
        return <FileAudio className={`${sizeClasses[size]} text-purple-500`} />;
      case 'code':
        return <FileCode className={`${sizeClasses[size]} text-yellow-500`} />;
      case 'pdf':
        return <FilePdf className={`${sizeClasses[size]} text-red-500`} />;
      case 'archive':
        return (
          <FileArchive className={`${sizeClasses[size]} text-orange-500`} />
        );
      case 'spreadsheet':
        return (
          <FileSpreadsheet className={`${sizeClasses[size]} text-green-500`} />
        );
      case 'presentation':
        return (
          <FilePieChart className={`${sizeClasses[size]} text-orange-500`} />
        );
      default:
        return (
          <FileText className={`${sizeClasses[size]} text-muted-foreground`} />
        );
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

  // Handle adding a comment
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    // In a real app, this would call an API to add the comment
    logger.info(`Adding comment to file ${file.id}: ${newComment}`);
    setNewComment('');
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    onDeleteAction(file.id);
    setConfirmDelete(false);
  };

  // Get permission badge
  const getPermissionBadge = (permission: string) => {
    switch (permission) {
      case 'private':
        return (
          <Badge variant="outline" className="gap-1">
            <Lock className="h-3.5 w-3.5" />
            Private
          </Badge>
        );
      case 'team':
        return <Badge className="bg-blue-500">Team</Badge>;
      case 'department':
        return <Badge className="bg-green-500">Department</Badge>;
      case 'organization':
        return <Badge className="bg-purple-500">Organization</Badge>;
      case 'public':
        return <Badge className="bg-orange-500">Public</Badge>;
      default:
        return null;
    }
  };

  return (
    <>
      <Sheet open={true} onOpenChange={open => !open && onCloseAction()}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 mr-2"
                onClick={onCloseAction}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="flex-1 mr-2">
                <SheetTitle className="text-xl truncate">
                  {file.name}
                </SheetTitle>
                <SheetDescription asChild>
                  <span className="flex items-center gap-2">
                    <span>{formatBytes(file.size)}</span>
                    <span>•</span>
                    <span className="capitalize">{file.type}</span>
                    {file.isLocked && (
                      <>
                        <span>•</span>
                        <Badge
                          variant="outline"
                          className="text-xs bg-red-500/10 text-red-500 border-red-500"
                        >
                          <Lock className="h-3 w-3 mr-1" />
                          Locked
                        </Badge>
                      </>
                    )}
                  </span>
                </SheetDescription>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10"
                onClick={() => onToggleStarAction(file.id)}
              >
                {file.starred ? (
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ) : (
                  <StarOff className="h-5 w-5" />
                )}
              </Button>
            </div>
          </SheetHeader>

          <div className="mt-6">
            {file.thumbnail &&
            (file.type === 'image' || file.type === 'video') ? (
              <div className="rounded-lg overflow-hidden mb-6 border">
                <img
                  src={file.thumbnail}
                  alt={file.name}
                  className="w-full h-auto aspect-video object-cover"
                />
              </div>
            ) : (
              <div className="flex justify-center mb-6">
                {getFileIcon(file.type, 'lg')}
              </div>
            )}

            <Tabs defaultValue="details" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="versions">
                  Versions ({file.versions.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4 mt-4">
                {file.description && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Description
                    </h3>
                    <p className="text-sm">{file.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Owner
                    </h3>
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
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Permissions
                    </h3>
                    {getPermissionBadge(file.permissions)}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    File Details
                  </h3>
                  <div className="bg-muted/50 rounded-md p-3 grid grid-cols-2 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Size:</span>
                    </div>
                    <div>{formatBytes(file.size)}</div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                    </div>
                    <div>{file.mimeType}</div>
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                    </div>
                    <div>{format(file.createdAt, 'MMM d, yyyy h:mm a')}</div>
                    <div>
                      <span className="text-muted-foreground">Modified:</span>
                    </div>
                    <div>{format(file.updatedAt, 'MMM d, yyyy h:mm a')}</div>
                    <div>
                      <span className="text-muted-foreground">
                        Last accessed:
                      </span>
                    </div>
                    <div>
                      {file.lastAccessedAt
                        ? format(file.lastAccessedAt, 'MMM d, yyyy h:mm a')
                        : 'Never'}
                    </div>

                    {file.metadata && Object.keys(file.metadata).length > 0 && (
                      <>
                        <div className="col-span-2 pt-2">
                          <h4 className="text-xs font-medium text-muted-foreground">
                            Additional Information
                          </h4>
                        </div>

                        {Object.entries(file.metadata).map(([key, value]) => (
                          <React.Fragment key={key}>
                            <div>
                              <span className="text-muted-foreground capitalize">
                                {key}:
                              </span>
                            </div>
                            <div>{value != null ? value.toString() : ''}</div>
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {file.tags.length > 0 ? (
                      file.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="gap-1">
                          <Tag className="h-3 w-3" />
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No tags
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Location
                  </h3>
                  <div className="text-sm">
                    <span>/{file.path.join('/')}</span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="activity" className="mt-4">
                <div className="mb-6">
                  <h3 className="text-sm font-medium mb-2">Comments</h3>

                  <div className="space-y-4">
                    {(file.comments ?? []).map((comment) => (
                      <div
                        key={comment.id}
                        className="flex gap-3 bg-muted/50 p-3 rounded-md"
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={comment.userAvatar}
                            alt={comment.userName}
                          />
                          <AvatarFallback>
                            {getInitials(comment.userName)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">
                              {comment.userName}
                            </p>
                            <span className="text-xs text-muted-foreground">
                              {format(
                                comment.timestamp,
                                'MMM d, yyyy h:mm a'
                              )}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}

                    <div className="flex gap-2 mt-4">
                      <Textarea
                        placeholder="Add a comment..."
                        value={newComment ?? ''}
                        onChange={e => setNewComment(e.target.value)}
                        className="resize-none"
                      />
                      <Button
                        className="flex-shrink-0"
                        size="icon"
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">
                    Activity Timeline
                  </h3>

                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-[1px] bg-muted-foreground/20" />

                    <div className="space-y-6">
                      <div className="relative pl-9">
                        <div className="absolute left-[1px] top-1 w-7 h-7 rounded-full bg-background flex items-center justify-center border">
                          <Upload className="h-3.5 w-3.5 text-green-500" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">File updated</p>
                            <p className="text-xs text-muted-foreground">
                              {format(file.updatedAt, 'MMM d, yyyy')}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {file.owner?.name ?? 'Unknown user'} uploaded version{' '}
                            {
                              Array.isArray(file.versions) && file.versions.length > 0
                                ? file.versions[file.versions.length - 1]?.versionNumber ?? ''
                                : ''
                            }
                          </p>
                        </div>
                      </div>

                      {(file.comments ?? []).map((comment) => (
                        <div key={comment.id} className="relative pl-9">
                          <div className="absolute left-[1px] top-1 w-7 h-7 rounded-full bg-background flex items-center justify-center border">
                            <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium">
                                Comment added
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {format(comment.timestamp, 'MMM d, yyyy')}
                              </p>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {comment.userName} commented on this file
                            </p>
                          </div>
                        </div>
                      ))}

                      <div className="relative pl-9">
                        <div className="absolute left-[1px] top-1 w-7 h-7 rounded-full bg-background flex items-center justify-center border">
                          <Plus className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between">
                            <p className="text-sm font-medium">File created</p>
                            <p className="text-xs text-muted-foreground">
                              {format(file.createdAt, 'MMM d, yyyy')}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {file.owner?.name ?? 'Unknown user'} created this file
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="versions" className="mt-4 space-y-4">
                <div className="space-y-2">
                  {file.versions.length > 0 && (
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Version History</h3>
                      <Button variant="outline" size="sm">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload New Version
                      </Button>
                    </div>
                  )}

                  <div className="space-y-2">
                    {file.versions
                      .slice()
                      .reverse()
                      .map((version, index) => (
                        <div
                          key={version.id}
                          className={`p-3 rounded-md border ${index === 0 ? 'bg-muted/50 border-primary' : ''}`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">
                                  Version {version.versionNumber}
                                </span>
                                {index === 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    Current
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground mt-1">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                {format(
                                  version.uploadedAt,
                                  'MMM d, yyyy h:mm a'
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatBytes(version.fileSize)}
                              </span>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download
                                  </DropdownMenuItem>
                                  {index !== 0 && (
                                    <DropdownMenuItem>
                                      <History className="mr-2 h-4 w-4" />
                                      Restore
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          <div className="mt-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-6 w-6">
                                <AvatarImage
                                  src={version.uploadedBy.avatar}
                                  alt={version.uploadedBy.name}
                                />
                                <AvatarFallback>
                                  {getInitials(version.uploadedBy.name)}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-xs">
                                {version.uploadedBy.name}
                              </span>
                            </div>
                          </div>

                          {version.comment && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              "{version.comment}"
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <SheetFooter className="mt-6 flex-row justify-between border-t pt-4 gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="default" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will move <strong>{file.name}</strong> to the trash. Files in
              trash will be automatically deleted after 30 days.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// Custom MessageSquare component to avoid importing unused icons
function MessageSquare(props: React.SVGProps<SVGSVGElement>) {
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
      aria-label="MessageSquare"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
