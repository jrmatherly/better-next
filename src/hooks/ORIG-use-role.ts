import { useSession } from '@/lib/auth/client';
import type { ExtendedSession } from '@/types/auth.d';
import { ROLES, type Role } from '@/types/roles';
import { useCallback, useState } from 'react';

/**
 * Hook for role-based authorization in client components
 *
 * Provides methods for checking role access and permissions based on
 * the current user's roles from the session.
 */
export function useRole() {
  // Cast the session response to the appropriate type
  const sessionResponse = useSession();
  const session = sessionResponse.data as ExtendedSession | null;
  const isLoading = sessionResponse.isPending || false;
  const isAuthenticated = !!session?.user;

  // State for handling impersonation loading state
  const [isImpersonating, setIsImpersonating] = useState(
    session?.user?.isImpersonating || false
  );
  const [impersonationLoading, setImpersonationLoading] = useState(false);

  // Get all roles assigned to the user
  const roles = session?.user?.roles || [];

  // Function to start impersonation
  const startImpersonation = useCallback(
    async (role: Role) => {
      if (!session?.user) return;

      try {
        setImpersonationLoading(true);

        const response = await fetch('/api/impersonation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role }),
        });

        if (!response.ok) {
          throw new Error('Failed to start impersonation');
        }

        // Force a page refresh to update the session
        window.location.reload();
      } catch (error) {
        console.error('Error starting impersonation:', error);
      } finally {
        setImpersonationLoading(false);
      }
    },
    [session]
  );

  // Function to end impersonation
  const endImpersonation = useCallback(async () => {
    try {
      setImpersonationLoading(true);

      const response = await fetch('/api/impersonation', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to end impersonation');
      }

      // Force a page refresh to update the session
      window.location.reload();
    } catch (error) {
      console.error('Error ending impersonation:', error);
    } finally {
      setImpersonationLoading(false);
    }
  }, []);

  return {
    // Basic session information
    roles,
    isLoading,
    isAuthenticated,

    // Impersonation state
    isImpersonating: session?.user?.isImpersonating || false,
    impersonationLoading,
    startImpersonation,
    endImpersonation,
    originalRoles: session?.user?.originalRoles || [],

    // Role check methods
    hasRole: (role: Role) => roles.includes(role),
    hasAnyRole: (checkRoles: Role[]) =>
      checkRoles.some(role => roles.includes(role)),
    hasAllRoles: (checkRoles: Role[]) =>
      checkRoles.every(role => roles.includes(role)),

    // Convenience methods for common role checks
    isAdmin: () => roles.includes(ROLES.ADMIN),
    isSecurity: () => roles.includes(ROLES.SECURITY),
    isDevOps: () => roles.includes(ROLES.DEVOPS),
    isDBA: () => roles.includes(ROLES.DBA),
    isCollab: () => roles.includes(ROLES.COLLAB),
    isTCC: () => roles.includes(ROLES.TCC),
    isFieldTech: () => roles.includes(ROLES.FIELDTECH),

    // Method to get the highest role based on a predefined hierarchy
    getHighestRole: () => {
      // Role hierarchy from highest to lowest permissions
      const roleHierarchy: Role[] = [
        ROLES.ADMIN,
        ROLES.SECURITY,
        ROLES.DEVOPS,
        ROLES.DBA,
        ROLES.COLLAB,
        ROLES.TCC,
        ROLES.FIELDTECH,
        ROLES.USER,
      ];

      // Find the highest role in the hierarchy that the user has
      return roleHierarchy.find(role => roles.includes(role)) || ROLES.USER;
    },
  };
}
