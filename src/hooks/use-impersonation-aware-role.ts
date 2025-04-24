'use client';

import { useAuth } from '@/providers/auth-provider';
import { hasAnyRole as checkAnyRole, hasRole, ROLES } from '@/lib/auth/role-utils';
import type { Role } from '@/types/roles';
import { useCallback } from 'react';

/**
 * Hook for checking role access with impersonation awareness
 * Uses existing role utilities while adding impersonation support
 */
export function useImpersonationAwareRole() {
  const { user, isAuthenticated } = useAuth();
  
  /**
   * Check if the user has any of the specified roles
   * @param roles Array of roles to check against
   * @returns true if the user has any of the roles
   */
  const hasAnyRole = useCallback(
    (roles: Role[]): boolean => {
      if (!isAuthenticated || !user || !user.roles) return false;
      
      // Delegate to existing utility function
      return checkAnyRole(user.roles, roles);
    },
    [isAuthenticated, user]
  );
  
  /**
   * Check if the user has all of the specified roles
   * @param roles Array of roles to check against
   * @returns true if the user has all of the roles
   */
  const hasAllRoles = useCallback(
    (roles: Role[]): boolean => {
      if (!isAuthenticated || !user || !user.roles) return false;
      
      // Check that every required role exists in the user's roles
      return roles.every(role => hasRole(user.roles, role));
    },
    [isAuthenticated, user]
  );
  
  /**
   * Check if the user is currently impersonating another role
   * @returns true if the user is impersonating
   */
  const isImpersonating = useCallback((): boolean => {
    if (!isAuthenticated || !user) return false;
    return !!user.isImpersonating;
  }, [isAuthenticated, user]);
  
  /**
   * Get the user's original roles (before impersonation)
   * @returns array of original roles or empty array if not available
   */
  const getOriginalRoles = useCallback((): Role[] => {
    if (!isAuthenticated || !user) return [];
    return (user.originalRoles || []) as Role[];
  }, [isAuthenticated, user]);
  
  /**
   * Check if the user has admin privileges (either real or impersonated)
   * @returns true if the user has admin role
   */
  const isAdmin = useCallback((): boolean => {
    if (!isAuthenticated || !user || !user.roles) return false;
    return hasRole(user.roles, ROLES.ADMIN);
  }, [isAuthenticated, user]);
  
  /**
   * Check if the user is a real admin (ignoring impersonation)
   * @returns true if the user is actually an admin
   */
  const isRealAdmin = useCallback((): boolean => {
    if (!isAuthenticated || !user) return false;
    
    // If impersonating, check original roles, otherwise check current roles
    const rolesToCheck = user.isImpersonating 
      ? (user.originalRoles || [])
      : user.roles || [];
      
    return hasRole(rolesToCheck as Role[], ROLES.ADMIN);
  }, [isAuthenticated, user]);
  
  return {
    hasAnyRole,
    hasAllRoles,
    isImpersonating,
    getOriginalRoles,
    isAdmin,
    isRealAdmin,
  };
}
