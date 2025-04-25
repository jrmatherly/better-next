'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth/client';
import type { ProtectedLayoutProps } from '@/types/auth';
import { Lock, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { FC } from 'react';

/**
 * Server-based layout component that enforces role-based access control
 * Used to protect entire sections/pages of the application
 *
 * This component uses a more reliable session approach for authentication
 * across all routes in the application.
 */
export const ServerProtectedLayout: FC<ProtectedLayoutProps> = ({
  children,
  allowedRoles,
  unauthorizedTitle = 'Access Denied',
  unauthorizedMessage = 'You do not have the required permissions to access this section.',
  requireAll = false,
  showLoading = true,
}) => {
  const router = useRouter();
  const session = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRoles, setHasRequiredRoles] = useState(false);

  // Check auth on component mount and whenever session data changes
  useEffect(() => {
    // Don't authenticate during SSR
    if (typeof window === 'undefined') return;

    if (session.isPending) {
      setIsLoading(true);
      return;
    }

    // Update authentication state based on session
    const user = session.data?.user;
    setIsAuthenticated(!!user);
    setIsLoading(false);

    // Check if user has required roles - only if authenticated
    if (user?.role) {
      const hasRoles = requireAll
        ? allowedRoles.length === 1 && user.role === allowedRoles[0]
        : allowedRoles.length === 0 || allowedRoles.includes(user.role);
      
      setHasRequiredRoles(hasRoles);
    } else {
      setHasRequiredRoles(false);
    }
  }, [session, allowedRoles, requireAll]);

  // Loading state during data fetching
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
  if (!isAuthenticated) {
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
            <Button onClick={() => router.push('/app')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // User is authenticated and authorized, render children
  return <>{children}</>;
};
