'use client';

import { useAuth } from '@/providers/auth-provider';
import { ROLES, type Role } from '@/types/roles';
import { useCallback } from 'react';

/**
 * Plugin types supported in the application
 */
export enum PluginType {
  admin = 'admin',
  apiKey = 'apiKey',
  jwt = 'jwt',
  openAPI = 'openAPI',
}

/**
 * Hook for checking plugin-specific access permissions
 * Uses the authenticated user's role to determine access to different plugin features
 */
export function usePluginAccess() {
  const { user, isAuthenticated } = useAuth();

  /**
   * Check if the user has access to a specific plugin
   * @param pluginType The plugin to check access for
   * @returns boolean indicating if the user has access
   */
  const hasPluginAccess = useCallback(
    (pluginType: PluginType): boolean => {
      if (!isAuthenticated || !user || !user.role) {
        return false;
      }

      const userRole = user.role as Role;

      // Define access requirements for each plugin
      switch (pluginType) {
        case PluginType.admin:
          // Only admins can access the admin plugin
          return userRole === ROLES.ADMIN;

        case PluginType.apiKey:
          // Admin and technical roles can access API keys
          return (
            userRole === ROLES.ADMIN /* ||
            userRole === ROLES.DEVOPS ||
            userRole === ROLES.SECURITY */
          );

        case PluginType.jwt:
          // Admin, security, and technical roles can access JWT tools
          return (
            userRole === ROLES.ADMIN /* ||
            userRole === ROLES.SECURITY ||
            userRole === ROLES.DEVOPS */
          );

        case PluginType.openAPI:
          // Admin and technical roles can access OpenAPI documentation
          return (
            userRole === ROLES.ADMIN /* ||
            userRole === ROLES.DEVOPS ||
            userRole === ROLES.SECURITY */
          );

        default:
          // Default to no access for unknown plugins
          return false;
      }
    },
    [isAuthenticated, user]
  );

  /**
   * Get the list of plugins the user has access to
   * @returns Array of PluginType values the user can access
   */
  const getAccessiblePlugins = useCallback((): PluginType[] => {
    return Object.values(PluginType).filter(plugin =>
      hasPluginAccess(plugin as PluginType)
    );
  }, [hasPluginAccess]);

  /**
   * Check if the user has admin role
   * @returns boolean indicating if the user has admin role
   */
  const isAdmin = useCallback((): boolean => {
    if (!isAuthenticated || !user || !user.role) {
      return false;
    }

    return user.role === ROLES.ADMIN;
  }, [isAuthenticated, user]);

  return {
    hasPluginAccess,
    getAccessiblePlugins,
    isAdmin,
  };
}
