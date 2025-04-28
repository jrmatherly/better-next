import { ImpersonateButton } from '@/components/admin/impersonate-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { hasAnyRole } from '@/lib/auth/role-utils';
import { auth } from '@/lib/auth/server';
import { ROLES, type Role } from '@/types/roles';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';

export const metadata: Metadata = {
  title: 'User Impersonation | Admin',
  description: 'Manage user impersonation for testing and troubleshooting',
};

/**
 * Admin page for managing user impersonation
 * Protected for admin roles only
 * Provides interface to select users and start impersonation
 */
export default async function ImpersonationPage() {
  // Verify admin access
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Redirect if not authenticated or no admin/security role
  if (!session?.user) {
    redirect('/login');
  }

  // Use hasAnyRole to check if user has any of the specified admin roles
  if (
    !session.user.role ||
    !hasAnyRole(
      [session.user.role as Role],
      [ROLES.ADMIN /* , ROLES.SECURITY */]
    )
  ) {
    redirect('/unauthorized');
  }

  // In a real implementation, we would fetch users from the database
  // This is a simplified example with mock data
  const users = [
    {
      id: 'user-1',
      name: 'Regular User',
      email: 'user@example.com',
      role: ROLES.USER,
    },
    {
      id: 'user-2',
      name: 'Field Technician',
      email: 'tech@example.com',
      role: ROLES.FIELDTECH,
    },
    {
      id: 'user-3',
      name: 'Database Admin',
      email: 'dba@example.com',
      role: ROLES.DBA,
    },
  ];

  return (
    <div className="container py-10">
      <h1 className="text-4xl font-bold mb-6">User Impersonation</h1>
      <p className="text-muted-foreground mb-8">
        Start an impersonation session to test the application from another
        user's perspective. Impersonation sessions are temporary and will expire
        after 1 hour.
      </p>

      <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-8">
        <h2 className="font-medium text-amber-800 mb-2">Security Notice</h2>
        <p className="text-amber-700 text-sm">
          All impersonation activity is logged for security auditing purposes.
          Only use impersonation for legitimate testing and support needs.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map(user => (
          <Card key={user.id}>
            <CardHeader>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="bg-slate-100 text-slate-800 px-2 py-1 rounded text-xs">
                  {user.role}
                </span>
                <ImpersonateButton userId={user.id} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
