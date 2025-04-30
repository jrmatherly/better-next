import type { NavItemType } from '@/types/navigation';
import { ROLES } from '@/types/roles';
import { Server } from 'lucide-react';

/**
 * Navigation items for Workload Hosting team
 */
export const workloadNavItems: NavItemType[] = [
  {
    title: 'Workload Hosting',
    url: '/workload-hosting',
    icon: Server,
    allowedRoles: [ROLES.ADMIN],
  },
];
