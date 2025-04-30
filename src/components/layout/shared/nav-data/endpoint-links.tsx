import type { NavItemType } from '@/types/navigation';
import { ROLES } from '@/types/roles';
import { Users } from 'lucide-react';

/**
 * Navigation items for Endpoint Technology team
 */
export const endpointNavItems: NavItemType[] = [
  {
    title: 'Endpoint Technology',
    url: '/endpoint-technology',
    icon: Users,
    allowedRoles: [ROLES.ADMIN, ROLES.FIELDTECH],
  },
];
