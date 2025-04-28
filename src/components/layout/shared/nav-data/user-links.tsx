import type { NavItemType } from '@/types/navigation';
import { Home, Settings2 /* SquareTerminal, */ } from 'lucide-react';

/**
 * Navigation data for user section sidebar
 */
export const userNavItems: NavItemType[] = [
  {
    title: 'Home',
    url: '/',
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
