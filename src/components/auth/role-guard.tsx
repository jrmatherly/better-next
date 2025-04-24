'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { useImpersonationAwareRole } from '@/hooks/use-impersonation-aware-role';
import { useAuth } from '@/providers/auth-provider';
import type { RoleAccessProps } from '@/types/auth';

/**
 * Component that conditionally renders content based on user roles
 * Fully supports role impersonation for testing purposes
 * 
 * This component uses the useImpersonationAwareRole hook, which is built on top
 * of the core role utilities in @/lib/auth/role-utils.ts but adds the impersonation
 * state awareness needed for proper UI protection during role testing.
 */
export function RoleGuard({
  children,
  allowedRoles,
  fallback,
  requireAll = false,
  showLoadingSkeleton = false,
}: RoleAccessProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const { hasAnyRole, hasAllRoles } = useImpersonationAwareRole();
  
  // Show loading state if configured
  if (isLoading) {
    return showLoadingSkeleton ? (
      <Skeleton className="h-10 w-full" />
    ) : null;
  }
  
  // User is not authenticated
  if (!isAuthenticated) {
    return fallback ? <>{fallback}</> : null;
  }
  
  // Check if user has required roles, using the impersonation-aware hooks
  const hasRequiredRoles = requireAll
    ? hasAllRoles(allowedRoles)
    : hasAnyRole(allowedRoles);
  
  // Render content or fallback based on role check
  return hasRequiredRoles ? <>{children}</> : fallback ? <>{fallback}</> : null;
}
