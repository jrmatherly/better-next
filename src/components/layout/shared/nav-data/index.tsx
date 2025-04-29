'use client';

import { adminNavItems } from './admin-links';
import { supportNavItems } from './support-links';
import type { NavItemType } from '@/types/navigation';
import { userNavItems } from './user-links';
import { useAuth } from '@/providers/auth-provider';

/**
 * Hook that provides navigation items based on user role permissions
 * 
 * @returns Object with main and secondary navigation items
 */
export function useNavigation() {
  const { 
    isAuthenticated, 
    hasAnyRole 
  } = useAuth();
  
  // Include different navigation items based on user's role permissions
  const mainNavItems = [
    // Always include user navigation items for authenticated users
    ...(isAuthenticated ? userNavItems : []),
    
    // Include admin items only if the user has admin role
    ...(hasAnyRole?.(['admin']) ? adminNavItems : [])
  ];
  
  return {
    navMain: mainNavItems,
    navSecondary: supportNavItems,
  };
}

/**
 * Export navigation items directly for easier imports
 */
export { adminNavItems, userNavItems, supportNavItems };
export type { NavItemType };
