'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/auth-provider';
import type { ProtectedLayoutProps } from '@/types/auth';
import { Lock, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { FC } from 'react';

/**
 * Layout component that enforces role-based access control
 * Used to protect entire sections/pages of the application
 *
 * This component checks user authentication and role permissions,
 * showing appropriate error states for unauthenticated or unauthorized users.
 */
export const ProtectedLayout: FC<ProtectedLayoutProps> = ({
  children,
  allowedRoles,
  unauthorizedTitle = 'Access Denied',
  unauthorizedMessage = 'You do not have the required permissions to access this section.',
  requireAll = false,
  showLoading = true,
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Show loading state if configured
  if (isLoading && showLoading) {
    return (
      <div className="flex h-full min-h-[300px] items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // Handle unauthenticated users
  if (!isAuthenticated || !user) {
    return (
      <div className="mx-auto max-w-md p-6">
        <div className="flex flex-col space-y-6">
          <Alert className="border-amber-500">
            <Lock className="h-5 w-5 text-amber-500" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to access this section. Please sign in
              with your account credentials.
            </AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button onClick={() => router.push('/login')}>Go to Login</Button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user has required roles
  const hasRequiredRoles = requireAll
    ? allowedRoles.every(role => user.role?.includes(role))
    : allowedRoles.length === 0 ||
      allowedRoles.some(role => user.role?.includes(role));

  // Show unauthorized message if user doesn't have required roles
  if (!hasRequiredRoles) {
    return (
      <div className="mx-auto max-w-md p-6">
        <div className="flex flex-col space-y-6">
          <Alert className="border-destructive">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <AlertTitle>{unauthorizedTitle}</AlertTitle>
            <AlertDescription>{unauthorizedMessage}</AlertDescription>
          </Alert>
          <div className="flex justify-center">
            <Button variant="outline" onClick={() => router.push('/')}>
              Return to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User has access, render children
  return <>{children}</>;
};
