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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import { getInitials } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import type {
  RequestComment,
  RequestStatus,
  ServiceRequest,
} from '@/types/services';
import { format } from 'date-fns';
import {
  AlertCircle,
  ArrowLeft,
  Calendar,
  CheckCheck,
  CheckCircle,
  Clock,
  Edit,
  FileCheck,
  FileClock,
  FilePlus,
  FileText,
  MessageSquare,
  Paperclip,
  Send,
  Timer,
  Trash2,
  XCircle,
} from 'lucide-react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

interface RequestDetailsProps {
  request: ServiceRequest;
  onCloseAction: () => void;
  onUpdateAction: (request: ServiceRequest) => void;
  onDeleteAction: (requestId: string) => void;
}

export function RequestDetails({
  request,
  onCloseAction,
  onUpdateAction,
  onDeleteAction,
}: RequestDetailsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState<RequestStatus>(request.status);
  const [openedFileIndex, setOpenedFileIndex] = useState<number | null>(null);

  // Form for status update
  const statusForm = useForm({
    defaultValues: {
      status: request.status,
      comment: '',
    },
  });

  // Handle form submission
  const onSubmitStatusUpdate = (data: {
    status: RequestStatus;
    comment: string;
  }) => {
    // Create a new comment if provided
    const updatedComments = [...request.comments];
    if (data.comment) {
      const newComment: RequestComment = {
        id: `comment-${Date.now()}`,
        userId: user?.id || 'unknown',
        userName: user?.name || 'Unknown User',
        userImage: user?.image || undefined,
        content: data.comment,
        timestamp: new Date(),
      };
      updatedComments.push(newComment);
    }

    // Update the request
    const updatedRequest: ServiceRequest = {
      ...request,
      status: data.status,
      updatedAt: new Date(),
      comments: updatedComments,
    };

    // If marked as completed, set completedAt
    if (data.status === 'completed' && request.status !== 'completed') {
      updatedRequest.completedAt = new Date();
    }

    onUpdateAction(updatedRequest);
    setIsUpdatingStatus(false);

    toast({
      title: 'Status updated',
      description: `Request status changed to ${formatStatus(data.status)}.`,
    });
  };

  // Handle adding a new comment
  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const comment: RequestComment = {
      id: `comment-${Date.now()}`,
      userId: user?.id || 'unknown',
      userName: user?.name || 'Unknown User',
      userImage: user?.image || undefined,
      content: newComment,
      timestamp: new Date(),
    };

    const updatedRequest: ServiceRequest = {
      ...request,
      comments: [...request.comments, comment],
      updatedAt: new Date(),
    };

    onUpdateAction(updatedRequest);
    setNewComment('');

    toast({
      title: 'Comment added',
      description: 'Your comment has been added to the request.',
    });
  };

  // Handle updating request status
  const handleStatusChange = (status: RequestStatus) => {
    setNewStatus(status);
  };

  // Handle approving the request
  const handleApproveRequest = () => {
    const updatedApprovals = request.approvals.map(approval =>
      approval.userId === user?.id
        ? { ...approval, status: 'approved' as const, timestamp: new Date() }
        : approval
    );

    // Check if all approvals are completed
    const allApproved = updatedApprovals.every(a => a.status === 'approved');

    const updatedRequest: ServiceRequest = {
      ...request,
      approvals: updatedApprovals,
      // If all approvals are complete, set status to approved
      status: allApproved ? 'approved' : request.status,
      updatedAt: new Date(),
    };

    onUpdateAction(updatedRequest);

    toast({
      title: 'Request approved',
      description: 'You have approved this request.',
    });
  };

  // Handle rejecting the request
  const handleRejectRequest = () => {
    const updatedApprovals = request.approvals.map(approval =>
      approval.userId === user?.id
        ? { ...approval, status: 'rejected' as const, timestamp: new Date() }
        : approval
    );

    const updatedRequest: ServiceRequest = {
      ...request,
      approvals: updatedApprovals,
      // If any approval is rejected, set status to rejected
      status: 'rejected',
      updatedAt: new Date(),
    };

    onUpdateAction(updatedRequest);

    toast({
      title: 'Request rejected',
      description: 'You have rejected this request.',
    });
  };

  // Format request status
  const formatStatus = (status: string) => {
    return status
      .split('_')
      .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(' ');
  };

  // Format request type
  const formatType = (type: string) => {
    return type
      .split('_')
      .map(word => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
      .join(' ');
  };

  // Get status badge based on request status
  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'draft':
        return (
          <Badge variant="outline" className="text-muted-foreground">
            <FilePlus className="mr-1 h-3 w-3" />
            Draft
          </Badge>
        );
      case 'submitted':
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-500">
            <FilePlus className="mr-1 h-3 w-3" />
            Submitted
          </Badge>
        );
      case 'pending_approval':
        return (
          <Badge className="bg-amber-500 text-white">
            <FileClock className="mr-1 h-3 w-3" />
            Pending Approval
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-blue-500 text-white">
            <FileCheck className="mr-1 h-3 w-3" />
            Approved
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-indigo-500 text-white">
            <Timer className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-green-500 text-white">
            <CheckCircle className="mr-1 h-3 w-3" />
            Completed
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="mr-1 h-3 w-3" />
            Rejected
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge
            variant="outline"
            className="border-destructive text-destructive"
          >
            <XCircle className="mr-1 h-3 w-3" />
            Cancelled
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Get priority badge
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return (
          <Badge
            variant="outline"
            className="border-destructive text-destructive"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            Critical
          </Badge>
        );
      case 'high':
        return (
          <Badge
            variant="outline"
            className="border-orange-500 text-orange-500"
          >
            <AlertCircle className="mr-1 h-3 w-3" />
            High
          </Badge>
        );
      case 'medium':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            Medium
          </Badge>
        );
      case 'low':
        return (
          <Badge variant="outline" className="border-green-500 text-green-500">
            Low
          </Badge>
        );
      default:
        return null;
    }
  };

  // Calculate completion progress based on status
  const getStatusProgress = (status: RequestStatus) => {
    const statuses: RequestStatus[] = [
      'draft',
      'submitted',
      'pending_approval',
      'approved',
      'in_progress',
      'completed',
    ];

    // Special cases for rejected and cancelled
    if (status === 'rejected') return 100;
    if (status === 'cancelled') return 100;

    const index = statuses.indexOf(status);
    if (index === -1) return 0;

    return Math.round((index / (statuses.length - 1)) * 100);
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  // Check if user can approve this request
  const canApprove =
    request.status === 'pending_approval' &&
    request.approvals.some(
      a => a.userId === user?.id && a.status === 'pending'
    );

  // Determine if user is the requestor
  const isRequestor = request.requestor.id === user?.id;

  // Determine if user is assigned to this request
  const isAssigned = request.assignedTo?.id === user?.id;

  return (
    <>
      <Sheet open={!!request} onOpenChange={open => !open && onCloseAction()}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={onCloseAction}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <SheetTitle className="text-xl">{request.title}</SheetTitle>
            </div>
            <SheetDescription className="flex flex-wrap items-center gap-2">
              <span className="font-mono">{request.id}</span>
              <span>•</span>
              {getStatusBadge(request.status)}
              <span>•</span>
              {getPriorityBadge(request.priority)}
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Description
              </h3>
              <p className="text-sm whitespace-pre-line">
                {request.description}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Progress
              </h3>
              <div className="h-2 bg-muted/50 rounded-md">
                <div
                  className="h-full bg-blue-500 rounded-md"
                  style={{ width: `${getStatusProgress(request.status)}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Submitted</span>
                <span>Approved</span>
                <span>Completed</span>
              </div>
            </div>

            {canApprove && (
              <div className="p-3 rounded-md bg-muted/50 border">
                <h3 className="text-sm font-medium mb-2">Approval Required</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  This request requires your approval.
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                    onClick={handleRejectRequest}
                  >
                    <XCircle className="mr-1.5 h-4 w-4" />
                    Reject
                  </Button>
                  <Button variant="default" onClick={handleApproveRequest}>
                    <CheckCheck className="mr-1.5 h-4 w-4" />
                    Approve
                  </Button>
                </div>
              </div>
            )}

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="comments">
                  Comments ({request.comments.length})
                </TabsTrigger>
                <TabsTrigger value="attachments">
                  Files ({request.attachments.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Type
                    </h3>
                    <p className="text-sm">{formatType(request.requestType)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Created
                    </h3>
                    <p className="text-sm">
                      {format(request.createdAt, 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Requestor
                    </h3>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-5 w-5">
                        <AvatarImage
                          src={request.requestor.image ?? undefined}
                        />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(request.requestor.name ?? '')}
                        </AvatarFallback>
                      </Avatar>
                      <p className="text-sm">{request.requestor.name}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">
                      Assigned To
                    </h3>
                    {request.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage
                            src={request.assignedTo?.image ?? undefined}
                          />
                          <AvatarFallback className="text-[10px]">
                            {getInitials(request.assignedTo?.name ?? '')}
                          </AvatarFallback>
                        </Avatar>
                        <p className="text-sm">{request.assignedTo.name}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Not assigned
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">
                    Due Date
                  </h3>
                  {request.dueDate ? (
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                      {format(request.dueDate, 'MMMM d, yyyy')}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No due date set
                    </p>
                  )}
                </div>

                {request.approvals.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Approvals
                    </h3>
                    <div className="space-y-2">
                      {request.approvals.map(approval => (
                        <div
                          key={approval.id}
                          className="flex justify-between items-center p-2 rounded-md bg-muted/50"
                        >
                          <div>
                            <p className="text-sm font-medium">
                              {approval.userName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {approval.role}
                            </p>
                          </div>
                          <div>
                            {approval.status === 'approved' && (
                              <Badge className="bg-green-500">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Approved
                              </Badge>
                            )}
                            {approval.status === 'rejected' && (
                              <Badge variant="destructive">
                                <XCircle className="mr-1 h-3 w-3" />
                                Rejected
                              </Badge>
                            )}
                            {approval.status === 'pending' && (
                              <Badge variant="outline">
                                <Clock className="mr-1 h-3 w-3" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {Object.keys(request.metadata ?? {}).length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                      Additional Information
                    </h3>
                    <div className="space-y-1">
                      {Object.entries(request.metadata ?? {}).map(
                        ([key, value]) => {
                          // Skip rendering if value is an object
                          if (typeof value === 'object' && value !== null)
                            return null;
                          // Format key for display
                          const formattedKey = key
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/^./, str => str.toUpperCase())
                            .replace(/([A-Z])/g, ' $1')
                            .replace(/_/g, ' ');

                          return (
                            <div key={key} className="grid grid-cols-2 gap-2">
                              <p className="text-sm text-muted-foreground">
                                {formattedKey}
                              </p>
                              <p className="text-sm">
                                {typeof value === 'string' ||
                                typeof value === 'number'
                                  ? value.toString()
                                  : ''}
                              </p>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="mt-4 space-y-4">
                <div className="space-y-4">
                  {request.comments.length === 0 ? (
                    <div className="text-center p-4">
                      <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No comments yet.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {request.comments.map(comment => (
                        <div
                          key={comment.id}
                          className="flex gap-3 p-3 rounded-md bg-muted/50"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={comment.userImage ?? undefined} />
                            <AvatarFallback>
                              {getInitials(comment.userName ?? '')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <p className="text-sm font-medium">
                                {comment.userName}
                              </p>
                              <span className="text-xs text-muted-foreground">
                                {format(comment.timestamp, 'MMM d, h:mm a')}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-line">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-end gap-2 pt-2">
                    <div className="flex-1">
                      <Textarea
                        placeholder="Add a comment..."
                        className="resize-none"
                        value={newComment}
                        onChange={e => setNewComment(e.target.value)}
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="attachments" className="mt-4">
                {request.attachments.length === 0 ? (
                  <div className="text-center p-4">
                    <Paperclip className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No attachments.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {request.attachments.map((attachment, index) => (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenedFileIndex(
                            index === openedFileIndex ? null : index
                          )
                        }
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setOpenedFileIndex(
                              index === openedFileIndex ? null : index
                            );
                          }
                        }}
                        className="flex items-center justify-between w-full p-3 rounded-md hover:bg-muted/50 cursor-pointer"
                        key={attachment.id}
                      >
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <span className="truncate max-w-[180px]">
                            {attachment.fileName}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.fileSize)}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          <Separator className="my-6" />

          <SheetFooter className="sm:justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                disabled={!isRequestor}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>

              {(isRequestor || isAssigned) &&
                request.status !== 'completed' &&
                request.status !== 'cancelled' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsUpdatingStatus(true)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Update Status
                  </Button>
                )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog for Deletion */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the request{' '}
              <strong>{request.id}</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmDelete(false);
                onDeleteAction(request.id);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status Update Dialog */}
      <Dialog open={isUpdatingStatus} onOpenChange={setIsUpdatingStatus}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Update Request Status</DialogTitle>
            <DialogDescription>
              Change the status of request {request.id}.
            </DialogDescription>
          </DialogHeader>
          <Form {...statusForm}>
            <form
              onSubmit={statusForm.handleSubmit(onSubmitStatusUpdate)}
              className="space-y-4"
            >
              <FormField
                control={statusForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={value => {
                        field.onChange(value);
                        handleStatusChange(value as RequestStatus);
                      }}
                      defaultValue={request.status}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {request.status === 'draft' && (
                          <SelectItem value="submitted">Submit</SelectItem>
                        )}
                        {request.status === 'submitted' && (
                          <SelectItem value="approved">Approve</SelectItem>
                        )}
                        {request.status !== 'in_progress' &&
                          request.status !== 'completed' &&
                          request.status !== 'cancelled' &&
                          request.status !== 'rejected' && (
                            <SelectItem value="in_progress">
                              In Progress
                            </SelectItem>
                          )}
                        {request.status === 'in_progress' && (
                          <SelectItem value="completed">Completed</SelectItem>
                        )}
                        {request.status !== 'completed' &&
                          request.status !== 'cancelled' &&
                          request.status !== 'rejected' && (
                            <SelectItem value="cancelled">Cancel</SelectItem>
                          )}
                        {request.status === 'submitted' && (
                          <SelectItem value="rejected">Reject</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={statusForm.control}
                name="comment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Comment (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a comment about this status change..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUpdatingStatus(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Update Status</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
