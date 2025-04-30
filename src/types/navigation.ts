import type { LucideIcon } from 'lucide-react';
import type { Role } from './roles';

/**
 * Type definition for navigation items used in sidebars
 */
export interface NavItemType {
  /**
   * Display title for the navigation item
   */
  title: string;

  /**
   * URL to navigate to when clicked
   * Use '#/' prefix for items that shouldn't navigate but only serve as dropdown parents
   */
  url: string;

  /**
   * Icon component to display alongside the title
   */
  icon: LucideIcon;

  /**
   * Optional child navigation items for creating dropdowns
   */
  items?: Omit<NavItemType, 'icon' | 'items'>[];

  /**
   * Optional array of roles that are allowed to see this navigation item
   * Used for team navigation items to control visibility based on user role
   */
  allowedRoles?: Role[];
}
