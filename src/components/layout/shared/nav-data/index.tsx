'use client';

import { useAuth } from '@/providers/auth-provider';
import type { NavItemType } from '@/types/navigation';
import type { Role } from '@/types/roles';
import { adminNavItems } from './admin-links';
import { collabNavItems } from './collab-links';
import { endpointNavItems } from './endpoint-links';
import { fieldTechNavItems } from './fieldtech-links';
import { supportNavItems } from './support-links';
import { userNavItems } from './user-links';
import { workloadNavItems } from './workload-links';
import React from 'react';

/**
 * Returns team navigation items filtered by user role
 *
 * @param userRole - The role of the current user
 * @returns - Navigation items that the user can access
 */
export function getTeamNavItemsByRole(userRole?: Role | string): NavItemType[] {
  if (!userRole) return [];

  // Combine all team navigation items
  const allTeamNavItems = [
    ...collabNavItems,
    ...fieldTechNavItems,
    ...endpointNavItems,
    ...workloadNavItems,
  ];

  // Filter items by user role
  return allTeamNavItems
    .filter(item => item.allowedRoles?.includes(userRole as Role))
    .map(({ allowedRoles, ...item }) => item);
}

/**
 * Hook that provides navigation items based on user role permissions
 *
 * @returns Object with main and secondary navigation items
 */
export function useNavigation() {
  const { isAuthenticated, hasAnyRole, user } = useAuth();
  const [navItems, setNavItems] = React.useState<{
    navMain: NavItemType[];
    navSecondary: NavItemType[];
  }>({
    navMain: [],
    navSecondary: supportNavItems,
  });

  // Immediate computation for initial render
  React.useLayoutEffect(() => {
    if (!isAuthenticated) {
      setNavItems({
        navMain: [],
        navSecondary: supportNavItems,
      });
      return;
    }
    
    // Build navigation items based on current auth state
    const mainNavItems = [
      // Always include user navigation items for authenticated users
      ...(isAuthenticated ? userNavItems : []),

      // Include admin items only if the user has admin role
      ...(hasAnyRole?.(['admin']) ? adminNavItems : []),

      // Include team items based on user's role
      ...(isAuthenticated && user?.role ? getTeamNavItemsByRole(user.role) : []),
    ];

    setNavItems({
      navMain: mainNavItems,
      navSecondary: supportNavItems,
    });
  }, [isAuthenticated, hasAnyRole, user?.role, user]);

  // Additional effect to force synchronization when isAuthenticated changes
  React.useEffect(() => {
    // When auth state changes, refresh navigation items immediately
    if (isAuthenticated && user?.role) {
      // Use requestAnimationFrame for immediate UI update
      requestAnimationFrame(() => {
        const mainNavItems = [
          ...userNavItems,
          ...(hasAnyRole?.(['admin']) ? adminNavItems : []),
          ...getTeamNavItemsByRole(user.role),
        ];
        
        setNavItems({
          navMain: mainNavItems,
          navSecondary: supportNavItems,
        });
      });
    }
  }, [isAuthenticated, user?.role, hasAnyRole]);

  return navItems;
}

/**
 * Export navigation items directly for easier imports
 */
export {
  adminNavItems,
  userNavItems,
  supportNavItems,
  collabNavItems,
  fieldTechNavItems,
  endpointNavItems,
  workloadNavItems,
};
export type { NavItemType };
