import type { Viewport } from 'next';
import { env } from '../env';

/*
 * Define Node environment
 */
/* export const isProd = process.env.NODE_ENV === 'production';
export const isDev = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test'; */

/*
 * Show logger in local development or when explicitly enabled
 */
/* export const loggerConfig = {
  enabled: isDev ? true : env.NEXT_PUBLIC_SHOW_LOGGER,
  level: env.NEXT_PUBLIC_LOG_LEVEL,
} as const;

export const showLogger = loggerConfig.enabled; */

/*
 * Define Application settings
 */
export const APP_AUTHOR = env.NEXT_PUBLIC_APP_AUTHOR || 'App Author';
export const APP_DESCRIPTION =
  env.NEXT_PUBLIC_APP_DESCRIPTION || 'App Description';
export const APP_LOGO = env.NEXT_PUBLIC_APP_LOGO || '/logo.png';
export const APP_NAME =
  process.env.NODE_ENV === 'development'
    ? `DEV - ${process.env.NEXT_PUBLIC_APP_NAME}`
    : process.env.NEXT_PUBLIC_APP_NAME;
export const UNAUTHENTICATED_URL = '/login';
export const AUTHENTICATED_URL = '/app';

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
