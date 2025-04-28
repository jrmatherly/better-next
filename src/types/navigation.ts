import type { LucideIcon } from 'lucide-react';

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
   * Optional child items for dropdown navigation
   */
  items?: Array<{
    title: string;
    url: string;
  }>;
}
