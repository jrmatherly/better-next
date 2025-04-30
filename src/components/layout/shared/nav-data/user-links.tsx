import type { NavItemType } from '@/types/navigation';
import {
  Home,
  LayoutDashboard,
  /* SquareTerminal, */ Settings2,
} from 'lucide-react';

/**
 * Navigation data for user section sidebar
 */
export const userNavItems: NavItemType[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Documentation',
    url: '/documentation',
    icon: Home,
  },
  {
    title: 'Files',
    url: '/files',
    icon: Home,
  },
  {
    title: 'Insights',
    url: '/insights',
    icon: Home,
  },
  {
    title: 'Resources',
    url: '/resources',
    icon: Home,
  },
  {
    title: 'VMware',
    url: '/vmware',
    icon: Home,
  },
  {
    title: 'User Settings',
    url: '#/',
    icon: Settings2,
    items: [
      {
        title: 'User Profile',
        url: '/user/profile',
      },
      {
        title: 'API Keys',
        url: '/user/settings/api-keys',
      },
    ],
  },
];
