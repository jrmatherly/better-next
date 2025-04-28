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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { authClient } from '@/lib/auth/client';
import { cn } from '@/lib/utils';
import type { User } from '@/types/auth';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Loader2, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { type FC, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Extracts a user-friendly error message from various error formats
 */
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (
    error &&
    typeof error === 'object' &&
    'error' in error &&
    error.error instanceof Error
  ) {
    return error.error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Enhanced UserManagement component for admin dashboard
 * Displays a list of users with options to manage them including:
 * - View details
 * - Delete users
 * - Impersonate users
 * - Revoke sessions
 * - Ban users with reason and expiration
 */
export const UserManagement: FC = () => {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | undefined>();

  // Action confirmation states
  const [userToImpersonate, setUserToImpersonate] = useState<string | null>(
    null
  );
  const [userToRevokeSession, setUserToRevokeSession] = useState<string | null>(
    null
  );
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  // Ban dialog state
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false);
  const [banForm, setBanForm] = useState({
    userId: '',
    reason: '',
    expirationDate: undefined as Date | undefined,
  });

  // Fetch users function
  const fetchUsers = useCallback(async (showSuccessToast = false) => {
    setIsLoading(true);
    try {
      // Using admin list users and type casting appropriately
      const data = await authClient.admin.listUsers(
        {
          query: {
            limit: 10,
            sortBy: 'createdAt',
            sortDirection: 'desc',
          },
        },
        {
          throw: true,
        }
      );
      // Cast the type to match expected User[] format
      setUsers((data?.users || []) as User[]);

      // Only show success toast on manual refresh
      if (showSuccessToast) {
        toast.success('User list refreshed successfully');
      }
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to fetch users');
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Only run once on mount
  useEffect(() => {
    fetchUsers(false); // Don't show success toast on initial load
  }, [fetchUsers]);

  /**
   * Confirmation handlers for impersonation
   */
  const confirmImpersonateUser = async () => {
    if (!userToImpersonate) return;

    setActionLoading(`impersonate-${userToImpersonate}`);
    try {
      // Use the BetterAuth admin client to impersonate a user
      await authClient.admin.impersonateUser({ userId: userToImpersonate });

      toast.success('Impersonated user');
      router.push('/user/profile');
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to impersonate user');
    } finally {
      setActionLoading(undefined);
      setUserToImpersonate(null);
    }
  };

  /**
   * Confirmation handlers for session revocation
   */
  const confirmRevokeSessions = async () => {
    if (!userToRevokeSession) return;

    setActionLoading(`revoke-${userToRevokeSession}`);
    try {
      // Use the BetterAuth admin client to revoke user sessions
      await authClient.admin.revokeUserSessions({
        userId: userToRevokeSession,
      });

      toast.success('Sessions revoked for user');
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to revoke sessions');
    } finally {
      setActionLoading(undefined);
      setUserToRevokeSession(null);
    }
  };

  /**
   * Confirmation handlers for deletion
   */
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    setActionLoading(`delete-${userToDelete}`);
    try {
      // First remove the user from the database
      // This ensures the database operation completes while we still have admin privileges
      await authClient.admin.removeUser({ userId: userToDelete });
      
      // Then revoke all sessions for the user to ensure immediate loss of access
      // This is crucial when using Redis for session storage
      await authClient.admin.revokeUserSessions({ userId: userToDelete });

      toast.success('User deleted successfully');
      // After successful deletion, filter the user out locally
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete));
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to delete user');
    } finally {
      setActionLoading(undefined);
      setUserToDelete(null);
    }
  };

  const handleImpersonateUser = (userId: string) => {
    setUserToImpersonate(userId);
  };

  const handleRevokeSessions = (userId: string) => {
    setUserToRevokeSession(userId);
  };

  const handleDeleteUser = (userId: string) => {
    setUserToDelete(userId);
  };

  const openBanDialog = (userId: string) => {
    setBanForm({
      userId,
      reason: '',
      expirationDate: undefined,
    });
    setIsBanDialogOpen(true);
  };

  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const { userId } = banForm;
    setActionLoading(`ban-${userId}`);
    try {
      if (!banForm.expirationDate) {
        throw new Error('Expiration date is required');
      }

      // Use the admin API to ban a user
      await authClient.admin.banUser({
        userId,
        banReason: banForm.reason,
        banExpiresIn: banForm.expirationDate.getTime() - new Date().getTime(),
      });

      toast.success('User banned successfully');
      setIsBanDialogOpen(false);
      fetchUsers(); // Refresh the user list
    } catch (error) {
      toast.error(getErrorMessage(error) || 'Failed to ban user');
    } finally {
      setActionLoading(undefined);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>
            View and manage user accounts and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableCaption>A list of all users</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.length > 0 ? (
                    users.map(user => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name || 'No name'}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{user.role || 'user'}</Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleImpersonateUser(user.id)}
                                disabled={!!actionLoading}
                                className="text-blue-600 border-blue-600 hover:bg-blue-600 hover:text-white rounded-full px-4"
                              >
                                {actionLoading === `impersonate-${user.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Impersonate'
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Impersonate User
                                </AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogDescription>
                                Are you sure you want to impersonate this user?
                              </AlertDialogDescription>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={confirmImpersonateUser}
                                >
                                  Impersonate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeSessions(user.id)}
                                disabled={!!actionLoading}
                                className="text-gray-400 border-gray-400 hover:bg-gray-500 hover:text-white rounded-full px-4"
                              >
                                {actionLoading === `revoke-${user.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Revoke Sessions'
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Revoke Sessions
                                </AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogDescription>
                                Are you sure you want to revoke sessions for
                                this user?
                              </AlertDialogDescription>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={confirmRevokeSessions}
                                >
                                  Revoke
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openBanDialog(user.id)}
                                disabled={!!actionLoading}
                                className="text-amber-600 border-amber-600 hover:bg-amber-600 hover:text-white rounded-full px-4"
                              >
                                {actionLoading === `ban-${user.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Ban'
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Ban User</AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogDescription>
                                Are you sure you want to ban this user? They
                                will be unable to access the system.
                              </AlertDialogDescription>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => setIsBanDialogOpen(true)}
                                >
                                  Continue
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteUser(user.id)}
                                disabled={!!actionLoading}
                                className="rounded-full px-4 bg-red-600 hover:bg-red-700"
                              >
                                {actionLoading === `delete-${user.id}` ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  'Delete'
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                              </AlertDialogHeader>
                              <AlertDialogDescription>
                                Are you sure you want to delete this user?
                              </AlertDialogDescription>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDeleteUser}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => fetchUsers(true)}
            disabled={isLoading}
            className="flex items-center gap-2"
            size="sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Refreshing...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Refresh Users</span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* Ban User Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleBanUser} className="space-y-4">
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                value={banForm.reason}
                onChange={e =>
                  setBanForm({ ...banForm, reason: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="expirationDate">Expiration Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="expirationDate"
                    variant={'outline'}
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !banForm.expirationDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {banForm.expirationDate ? (
                      format(banForm.expirationDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={banForm.expirationDate}
                    onSelect={date =>
                      setBanForm({ ...banForm, expirationDate: date })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsBanDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={
                  !banForm.reason || !banForm.expirationDate || !!actionLoading
                }
              >
                {actionLoading === `ban-${banForm.userId}` ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Ban User
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};
