'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { useAdmin } from '@/hooks/use-admin';
import type { User } from '@/types/auth';
import { type FC, useCallback, useEffect, useRef, useState } from 'react';

/**
 * UserManagement component for admin dashboard
 * Displays a list of users with options to view, edit or delete them
 */
export const UserManagement: FC = () => {
  // Store the admin hook in a ref so it's not a dependency that changes between renders
  const adminRef = useRef(useAdmin());
  const [users, setUsers] = useState<User[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch users function that doesn't depend on any props or state
  const fetchUsers = useCallback(() => {
    setIsLoading(true);
    
    // This uses the ref's current value, not a render-dependent prop
    adminRef.current.getUsers()
      .then(fetchedUsers => {
        if (fetchedUsers) {
          setUsers(fetchedUsers);
        }
      })
      .catch(error => {
        console.error("Failed to fetch users:", error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Only run once on mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId: string) => {
    setIsDeleting(userId);
    
    try {
      const success = await adminRef.current.deleteUser(userId);
      if (success) {
        // After successful deletion, just filter the user out locally
        // This avoids needing to refetch the entire list
        setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      }
    } finally {
      setIsDeleting(null);
    }
  };

  return (
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
                        <Badge variant="outline">
                          {user.role || 'user'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isDeleting === user.id}
                        >
                          {isDeleting === user.id ? 'Deleting...' : 'Delete'}
                        </Button>
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
        <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
          {isLoading ? 'Refreshing...' : 'Refresh Users'}
        </Button>
      </CardFooter>
    </Card>
  );
};
