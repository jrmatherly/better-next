import { useSession } from '@/lib/auth/client';
import { 
  ROLES, 
  type Role 
} from '@/types/roles';
import type { ExtendedSession } from '@/types/auth.d';
import { useState, useCallback } from 'react';

/**
 * Hook for role-based authorization in client components
 * 
 * Provides methods for checking role access and permissions based on
 * the current user's role from the session.
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
  
  // Get the user's role
  const userRole = session?.user?.role || 'user';
  
  // Function to start impersonation
  const startImpersonation = useCallback(async (role: Role | string) => {
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
      
      setIsImpersonating(true);
      // Force a session refresh to get the new role
      window.location.reload();
    } catch (error) {
      console.error('Impersonation error:', error);
    } finally {
      setImpersonationLoading(false);
    }
  }, [session?.user]);
  
  // Function to end impersonation
  const endImpersonation = useCallback(async () => {
    if (!session?.user || !isImpersonating) return;
    
    try {
      setImpersonationLoading(true);
      
      const response = await fetch('/api/impersonation', {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to end impersonation');
      }
      
      setIsImpersonating(false);
      // Force a session refresh to restore original role
      window.location.reload();
    } catch (error) {
      console.error('Ending impersonation error:', error);
    } finally {
      setImpersonationLoading(false);
    }
  }, [session?.user, isImpersonating]);
  
  return {
    isLoading,
    isImpersonating,
    impersonationLoading,
    startImpersonation,
    endImpersonation,
    isAuthenticated,
    userRole,
    originalRoles: session?.user?.originalRoles || [],
    
    // Role checking functions
    hasRole: (role: Role | string) => userRole === role,
    hasAnyRole: (checkRoles: (Role | string)[]) => checkRoles.includes(userRole as Role | string),
    hasAllRoles: (checkRoles: (Role | string)[]) => checkRoles.length === 1 && checkRoles[0] === userRole,
    
    // Specific role checks
    isAdmin: () => userRole === ROLES.ADMIN,
    isSecurity: () => userRole === ROLES.SECURITY,
    isDevOps: () => userRole === ROLES.DEVOPS,
    isDBA: () => userRole === ROLES.DBA,
    isCollab: () => userRole === ROLES.COLLAB,
    isTCC: () => userRole === ROLES.TCC,
    isFieldTech: () => userRole === ROLES.FIELDTECH,
    
    // Get highest role (with single role, it's always the current role)
    getHighestRole: () => userRole as Role,
  };
}
