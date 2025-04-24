'use client';

import { useAuth } from '@/providers/auth-provider';
import { ROLES, type Role } from '@/types/roles';
import { useCallback } from 'react';

/**
 * Plugin types supported in the application
 */
export type PluginType =
  | 'admin'
  | 'apiKey'
  | 'jwt'
  | 'organization'
  | 'openAPI';

/**
 * Hook for checking plugin-specific access permissions
 * Uses the authenticated user's roles to determine access to different plugin features
 */
export function usePluginAccess() {
  const { user, isAuthenticated } = useAuth();

  /**
   * Check if the user has access to a specific plugin
   * @param pluginType The plugin type to check access for
   * @returns boolean indicating if the user has access
   */
  const hasPluginAccess = useCallback(
    (pluginType: PluginType): boolean => {
      if (!isAuthenticated || !user || !user.roles) {
        return false;
      }

      const userRoles = user.roles;

      // Define access requirements for each plugin
      switch (pluginType) {
        case 'admin':
          // Only admin role can access admin plugin
          return userRoles.includes(ROLES.ADMIN);

        case 'apiKey':
          // Admin and technical roles can access API keys
          return userRoles.some(role => {
            const roleValue = role as Role;
            return (
              roleValue === ROLES.ADMIN ||
              roleValue === ROLES.DEVOPS ||
              roleValue === ROLES.SECURITY
            );
          });

        case 'jwt':
          // Admin, security, and technical roles can access JWT tools
          return userRoles.some(role => {
            const roleValue = role as Role;
            return (
              roleValue === ROLES.ADMIN ||
              roleValue === ROLES.SECURITY ||
              roleValue === ROLES.DEVOPS
            );
          });

        case 'organization':
          // All authenticated users can access organizations,
          // but their actions might be restricted at the API level
          return true;

        case 'openAPI':
          // Admin and technical roles can access OpenAPI documentation
          return userRoles.some(role => {
            const roleValue = role as Role;
            return (
              roleValue === ROLES.ADMIN ||
              roleValue === ROLES.DEVOPS ||
              roleValue === ROLES.SECURITY
            );
          });

        default:
          return false;
      }
    },
    [isAuthenticated, user]
  );

  /**
   * Check if the user is an administrator
   * @returns boolean indicating if the user has admin role
   */
  const isAdmin = useCallback((): boolean => {
    if (!isAuthenticated || !user || !user.roles) {
      return false;
    }

    return user.roles.includes(ROLES.ADMIN);
  }, [isAuthenticated, user]);

  return {
    hasPluginAccess,
    isAdmin,
  };
}
