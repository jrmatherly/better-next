import type { NavItemType } from '@/types/navigation';
import { Settings2 /* , SquareTerminal */ } from 'lucide-react';

/**
 * Navigation data for admin section sidebar
 */
export const adminNavItems: NavItemType[] = [
  /* {
    title: 'Dashboard',
    url: '/admin/dashboard',
    icon: SquareTerminal,
  }, */
  {
    title: 'Admin Resources',
    url: '#/',
    icon: Settings2,
    items: [
      {
        title: 'Admin Dashboard',
        url: '/admin/dashboard',
      },
      {
        title: 'Admin Tools - JWT',
        url: '/admin/tools/jwt',
      },
      {
        title: 'Impersonate User',
        url: '/admin/impersonation',
      },
      {
        title: 'Client Side',
        url: '/admin/tools/auth-debug/client',
      },
      {
        title: 'Server Side',
        url: '/admin/tools/auth-debug/server',
      },
    ],
  },
];
