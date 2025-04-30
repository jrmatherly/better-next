import type { NavItemType } from '@/types/navigation';
import { ROLES } from '@/types/roles';
import { Fingerprint } from 'lucide-react';

/**
 * Navigation items for Field Technology team
 */
export const fieldTechNavItems: NavItemType[] = [
  {
    title: 'Field Technology',
    url: '/field-technology',
    icon: Fingerprint,
    allowedRoles: [ROLES.ADMIN, ROLES.FIELDTECH],
  },
];
