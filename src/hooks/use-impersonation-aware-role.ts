'use client';

import { ROLES, type Role } from '@/types/roles';
import { useAuth } from '@/providers/auth-provider';
import { useCallback } from 'react';

/**
 * Hook for role-based authorization with impersonation awareness
 */
export function useImpersonationAwareRole() {
  const { user, isAuthenticated } = useAuth();

  /**
   * Check if the user has any of the specified roles
   * @param roles Array of roles to check against
   * @returns boolean indicating if user has any of the specified roles
   */
  const hasAnyRole = useCallback(
    (roles: (Role | string)[]): boolean => {
      if (!isAuthenticated || !user || !user.role) return false;

      // Check if user's role is in the allowed roles array
      return roles.includes(user.role as Role | string);
    },
    [isAuthenticated, user]
  );

  /**
   * Check if the user has all of the specified roles
   * @param roles Array of roles to check against
   * @returns boolean indicating if user has all of the specified roles
   */
  const hasAllRoles = useCallback(
    (roles: (Role | string)[]): boolean => {
      if (!isAuthenticated || !user || !user.role) return false;

      // With a single role, all roles match only if there's exactly one required role
      // and it matches the user's role
      return roles.length === 1 && roles[0] === user.role;
    },
    [isAuthenticated, user]
  );

  /**
   * Check if the user is currently impersonating another role
   * @returns true if the user is impersonating
   */
  const isImpersonating = useCallback(() => {
    if (!isAuthenticated || !user) return false;
    return !!user.isImpersonating;
  }, [isAuthenticated, user]);

  /**
   * Get the user's original roles (before impersonation)
   * @returns array of original roles or empty array if not available
   */
  const getOriginalRoles = useCallback(() => {
    if (!isAuthenticated || !user) return [];
    return (user.originalRoles || []) as Role[];
  }, [isAuthenticated, user]);

  /**
   * Check if the user has admin privileges (either real or impersonated)
   * @returns true if the user has admin role
   */
  const isAdmin = useCallback((): boolean => {
    if (!isAuthenticated || !user || !user.role) return false;
    return user.role === ROLES.ADMIN;
  }, [isAuthenticated, user]);

  /**
   * Check if the user is a real admin (ignoring impersonation)
   * @returns true if the user is actually an admin
   */
  const isRealAdmin = useCallback((): boolean => {
    if (!isAuthenticated || !user) return false;

    // If impersonating, check original roles, otherwise check current role
    if (user.isImpersonating && user.originalRoles && user.originalRoles.length > 0) {
      return user.originalRoles.includes(ROLES.ADMIN);
    }
    
    return user.role === ROLES.ADMIN;
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
