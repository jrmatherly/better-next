import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    /** Node.js Configuration */
    /* IGNORE_SSL_VERIFICATION: z
      .string()
      .transform(val => val.toLowerCase() === 'true')
      .default('true'),
    NODE_ENV: z
      .enum(['development', 'test', 'production'])
      .default('development'),
    NODE_TLS_REJECT_UNAUTHORIZED: z.string().optional(),
    PORT: z.coerce.number().default(3000), */

    /** Database URLs */
    DATABASE_URL: z
      .string()
      .url()
      .refine(
        url =>
          url.startsWith('postgresql://') ||
          url.startsWith('postgres://') ||
          url.startsWith('mysql://') ||
          url.startsWith('sqlite://'),
        { message: 'DATABASE_URL must be a valid database connection string' }
      ),
    DB_HOST: z.string().default('localhost'),
    DB_NAME: z.string().default('nextbetterauth'),
    DB_PASSWORD: z.string().default('supersecret'),
    DB_PORT: z.coerce.number().default(5432),
    DB_USER: z.string().default('nextjs'),
    /* DATABASE_URL_DEVELOPMENT: z
      .string()
      .url()
      .refine(
        url =>
          url.startsWith('postgresql://') ||
          url.startsWith('postgres://') ||
          url.startsWith('mysql://') ||
          url.startsWith('sqlite://'),
        { message: 'DATABASE_URL must be a valid database connection string' }
      ),
    DATABASE_URL_PRODUCTION: z
      .string()
      .url()
      .refine(
        url =>
          url.startsWith('postgresql://') ||
          url.startsWith('postgres://') ||
          url.startsWith('mysql://') ||
          url.startsWith('sqlite://'),
        { message: 'DATABASE_URL must be a valid database connection string' }
      ), */

    /** Redis Configuration */
    REDIS_HOST: z.string().default('localhost'),
    REDIS_PASSWORD: z.string().optional().default('supersecret'),
    REDIS_PORT: z.coerce.number().default(6379),
    REDIS_URL: z.string().url().default('redis://localhost:6379'),

    /** Authentication Configuration */
    AUTH_TRUST_HOST: z
      .string()
      .transform(val => val.toLowerCase() === 'true')
      .default('false'),
    BETTER_AUTH_DEBUG: z
      .string()
      .transform(val => val.toLowerCase() === 'true')
      .default('false'),
    BETTER_AUTH_SECRET: z.string().default('mh7DwzQj9MmpFgNoDIk4dVdFsTxzW25'),
    BETTER_AUTH_URL: z.string().url().default('http://localhost:3000'),

    /** OAuth Configuration */
    MICROSOFT_CLIENT_ID: z.string().optional(),
    MICROSOFT_CLIENT_SECRET: z.string().optional(),
    MICROSOFT_TENANT_ID: z.string().optional(),
    /* GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    GITHUB_CLIENT_ID: z.string().optional(),
    GITHUB_CLIENT_SECRET: z.string().optional(), */

    /** Email Configuration */
    EMAIL_SMTP_HOST: z.string(),
    EMAIL_SMTP_PASSWORD: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters long' }),
    EMAIL_SMTP_PORT: z.coerce.number().default(587),
    EMAIL_SMTP_USER: z
      .string()
      .email({ message: 'Invalid email address format' }),

    /** Application Monitoring */
    SENTRY_ANALYZE: z
      .string()
      .transform(val => val.toLowerCase() === 'true')
      .default('false'),
    SENTRY_AUTH_TOKEN: z.string().optional(),
    SENTRY_CI: z
      .string()
      .transform(val => val.toLowerCase() === 'true')
      .default('false'),
    SENTRY_DSN: z.string().optional(),
    SENTRY_ORG: z.string().optional(),
    SENTRY_PROJECT: z.string().optional(),
    SENTRY_URL: z.string().url().optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    /** Application Configuration */
    NEXT_PUBLIC_APP_AUTHOR: z.string().default('App Author'),
    NEXT_PUBLIC_APP_CONTACT_EMAIL: z
      .string()
      .email()
      .default('email@example.com'),
    NEXT_PUBLIC_APP_DESCRIPTION: z.string().default('App Description'),
    NEXT_PUBLIC_APP_DOMAIN: z.string().default('localhost'),
    NEXT_PUBLIC_APP_LOGO: z.string().default('/logo.png'),
    NEXT_PUBLIC_APP_NAME: z.string().default('App Name'),
    NEXT_PUBLIC_APP_REPO_URL: z
      .string()
      .url()
      .default('https://github.com/jrmatherly/better-next'),
    NEXT_PUBLIC_APP_TIMEZONE: z.string().default('America/New_York'),
    NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),

    /** Logging Configuration */
    NEXT_PUBLIC_LOG_LEVEL: z
      .enum(['debug', 'info', 'warn', 'error'])
      .default('info'),
    NEXT_PUBLIC_SHOW_LOGGER: z
      .string()
      .transform(val => val.toLowerCase() === 'true')
      .default('false'),

    /** Analytics Configuration */
    NEXT_PUBLIC_UMAMI_HOST: z.string().optional(),
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().optional(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    /** Node.js Configuration */
    /* IGNORE_SSL_VERIFICATION: process.env.IGNORE_SSL_VERIFICATION,
    NODE_ENV: process.env.NODE_ENV,
    NODE_TLS_REJECT_UNAUTHORIZED: process.env.NODE_TLS_REJECT_UNAUTHORIZED,
    PORT: process.env.PORT, */

    /** Database URLs */
    DATABASE_URL: process.env.DATABASE_URL,
    DB_HOST: process.env.DB_HOST,
    DB_NAME: process.env.DB_NAME,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_PORT: process.env.DB_PORT,
    DB_USER: process.env.DB_USER,
    /* DATABASE_URL_DEVELOPMENT: process.env.DATABASE_URL_DEVELOPMENT,
    DATABASE_URL_PRODUCTION: process.env.DATABASE_URL_PRODUCTION, */

    /** Redis Configuration */
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_URL: process.env.REDIS_URL,

    /** Authentication Configuration */
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    BETTER_AUTH_DEBUG: process.env.BETTER_AUTH_DEBUG,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,

    /** OAuth Configuration */
    MICROSOFT_CLIENT_ID: process.env.MICROSOFT_CLIENT_ID,
    MICROSOFT_CLIENT_SECRET: process.env.MICROSOFT_CLIENT_SECRET,
    MICROSOFT_TENANT_ID: process.env.MICROSOFT_TENANT_ID,
    /* GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET, */

    /** Email Configuration */
    EMAIL_SMTP_HOST: process.env.EMAIL_SMTP_HOST,
    EMAIL_SMTP_PASSWORD: process.env.EMAIL_SMTP_PASSWORD,
    EMAIL_SMTP_PORT: process.env.EMAIL_SMTP_PORT,
    EMAIL_SMTP_USER: process.env.EMAIL_SMTP_USER,

    /** Application Configuration */
    NEXT_PUBLIC_APP_AUTHOR: process.env.NEXT_PUBLIC_APP_AUTHOR,
    NEXT_PUBLIC_APP_CONTACT_EMAIL: process.env.NEXT_PUBLIC_APP_CONTACT_EMAIL,
    NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
    NEXT_PUBLIC_APP_DOMAIN: process.env.NEXT_PUBLIC_APP_DOMAIN,
    NEXT_PUBLIC_APP_LOGO: process.env.NEXT_PUBLIC_APP_LOGO,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_APP_REPO_URL: process.env.NEXT_PUBLIC_APP_REPO_URL,
    NEXT_PUBLIC_APP_TIMEZONE: process.env.NEXT_PUBLIC_APP_TIMEZONE,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,

    /** Logging Configuration */
    NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
    NEXT_PUBLIC_SHOW_LOGGER: process.env.NEXT_PUBLIC_SHOW_LOGGER,

    /** Application Monitoring */
    SENTRY_ANALYZE: process.env.SENTRY_ANALYZE,
    SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
    SENTRY_CI: process.env.SENTRY_CI,
    SENTRY_DSN: process.env.SENTRY_DSN,
    SENTRY_ORG: process.env.SENTRY_ORG,
    SENTRY_PROJECT: process.env.SENTRY_PROJECT,
    SENTRY_URL: process.env.SENTRY_URL,

    /** Analytics Configuration */
    NEXT_PUBLIC_UMAMI_HOST: process.env.NEXT_PUBLIC_UMAMI_HOST,
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
