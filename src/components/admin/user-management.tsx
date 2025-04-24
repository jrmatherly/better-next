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
import { type FC, useEffect, useState } from 'react';

/**
 * UserManagement component for admin dashboard
 * Displays a list of users with options to view, edit or delete them
 */
export const UserManagement: FC = () => {
  const { getUsers, deleteUser, isLoading } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      const fetchedUsers = await getUsers();
      if (fetchedUsers) {
        setUsers(fetchedUsers);
      }
    };

    fetchUsers();
  }, [getUsers]);

  const handleDeleteUser = async (userId: string) => {
    setIsDeleting(userId);
    const success = await deleteUser(userId);
    if (success) {
      setUsers(users.filter(user => user.id !== userId));
    }
    setIsDeleting(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
        <CardDescription>
          View and manage all users in the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <Table>
            <TableCaption>A list of all users in the system</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name || 'No name'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {user.roles?.map(role => (
                          <Badge key={role as string} variant="outline">
                            {role as string}
                          </Badge>
                        ))}
                        {!user.roles?.length && (
                          <Badge
                            variant="outline"
                            className="text-muted-foreground"
                          >
                            No roles
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          aria-label={`View details for ${user.name || user.email}`}
                        >
                          View
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isDeleting === user.id}
                          onClick={() => handleDeleteUser(user.id)}
                          aria-label={`Delete user ${user.name || user.email}`}
                        >
                          {isDeleting === user.id ? 'Deleting...' : 'Delete'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Export Users</Button>
        <Button>Add New User</Button>
      </CardFooter>
    </Card>
  );
};
