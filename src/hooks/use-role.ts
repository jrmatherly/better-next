import { useSession } from '@/lib/auth/client';
import { 
  ROLES, 
  type Role 
} from '@/types/roles';
import {
  hasRole as checkHasRole,
  hasAnyRole as checkHasAnyRole,
  getHighestRole as getHighestRoleUtil
} from '@/lib/auth/role-utils';
import type { ExtendedSession } from '@/types/auth.d';
import { useState, useCallback } from 'react';

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
  const startImpersonation = useCallback(async (role: Role) => {
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
  }, [session]);
  
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
    
    // Use utility functions from role-utils.ts
    hasRole: (role: Role) => checkHasRole(roles, role),
    hasAnyRole: (checkRoles: Role[]) => checkHasAnyRole(roles, checkRoles),
    hasAllRoles: (checkRoles: Role[]) => checkRoles.every(role => roles.includes(role)),
    
    // Convenience methods for common role checks - using the centralized utility
    isAdmin: () => checkHasRole(roles, ROLES.ADMIN),
    isSecurity: () => checkHasRole(roles, ROLES.SECURITY),
    isDevOps: () => checkHasRole(roles, ROLES.DEVOPS),
    isDBA: () => checkHasRole(roles, ROLES.DBA),
    isCollab: () => checkHasRole(roles, ROLES.COLLAB),
    isTCC: () => checkHasRole(roles, ROLES.TCC),
    isFieldTech: () => checkHasRole(roles, ROLES.FIELDTECH),
    
    // Use the utility function instead of duplicating the role hierarchy logic
    getHighestRole: () => getHighestRoleUtil(roles),
  };
}
