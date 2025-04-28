import type { NavItemType } from '@/types/navigation';
import { LifeBuoy } from 'lucide-react';

/**
 * Navigation data for the support section in sidebars
 * This is shared between admin and user interfaces
 */
export const supportNavItems: NavItemType[] = [
  /* {
    title: 'Support',
    url: '#',
    icon: LifeBuoy,
  }, */
  {
    title: 'Support Resources',
    url: '#/',
    icon: LifeBuoy,
    items: [
      {
        title: 'Support Resource 1',
        url: '/support1',
      },
      {
        title: 'Support Resource 2',
        url: '/support2',
      },
      {
        title: 'Support Resource 3',
        url: '/support3',
      },
      {
        title: 'Support Resource 4',
        url: '/support4',
      },
      {
        title: 'Support Resource 5',
        url: '/support5',
      },
    ],
  },
];
