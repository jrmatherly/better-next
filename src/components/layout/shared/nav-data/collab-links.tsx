import type { NavItemType } from '@/types/navigation';
import { ROLES } from '@/types/roles';
import { Headphones } from 'lucide-react';

/**
 * Navigation items for Collaboration Services team
 */
export const collabNavItems: NavItemType[] = [
  {
    title: 'Collaboration Services',
    url: '/collaboration-services',
    icon: Headphones,
    allowedRoles: [ROLES.ADMIN, ROLES.COLLAB],
  },
];
