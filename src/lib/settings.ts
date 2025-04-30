import { env } from '@/env';
import type { Viewport } from 'next';

/*
 * Define Application settings
 */
export const APP_AUTHOR = env.NEXT_PUBLIC_APP_AUTHOR || 'App Author';
export const APP_DESCRIPTION =
  env.NEXT_PUBLIC_APP_DESCRIPTION || 'App Description';
export const APP_LOGO = env.NEXT_PUBLIC_APP_LOGO || '/logo.png';
export const APP_NAME =
  process.env.NODE_ENV === 'development'
    ? `DEV - ${process.env.NEXT_PUBLIC_APP_NAME || 'Better Next'}`
    : process.env.NEXT_PUBLIC_APP_NAME || 'Better Next';
export const UNAUTHENTICATED_URL = '/login';
export const AUTHENTICATED_URL = '/dashboard';

/*
 * Define default viewport settings
 */
export const defaultViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#000000' },
  ],
};

/*
 * Define Site Config and export as type
 */
export type SiteConfig = typeof siteConfig;
export const siteConfig = {
  name: APP_NAME,
  description: APP_DESCRIPTION,
  author: APP_AUTHOR,
  logo: APP_LOGO,
};
