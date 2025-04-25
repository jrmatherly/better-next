/* import { PrismaClient } from '../../../prisma/client'; */
import { db } from '@/db';
import { ROLES } from '@/types/roles';
import type { BetterAuthOptions, User } from 'better-auth';
/* import { prismaAdapter } from 'better-auth/adapters/prisma'; */
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, apiKey, jwt, openAPI } from 'better-auth/plugins';
import { createClient } from 'redis';
import * as schema from '../../db/schema';

interface SecondaryStorage {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

const redis = createClient();
await redis.connect();

const APP_NAME =
  process.env.NODE_ENV === 'development'
    ? `DEV - ${process.env.NEXT_PUBLIC_APP_NAME}`
    : process.env.NEXT_PUBLIC_APP_NAME;

// Ensure environment variables for Microsoft provider are defined
const MICROSOFT_CLIENT_ID = process.env.MICROSOFT_CLIENT_ID;
const MICROSOFT_CLIENT_SECRET = process.env.MICROSOFT_CLIENT_SECRET;
const MICROSOFT_TENANT_ID = process.env.MICROSOFT_TENANT_ID;

if (!MICROSOFT_CLIENT_ID || !MICROSOFT_CLIENT_SECRET || !MICROSOFT_TENANT_ID) {
  console.warn(
    'Microsoft provider environment variables are not properly configured'
  );
}

export const authConfig = {
  appName: APP_NAME,
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'],
  logger: {
    disabled: process.env.NODE_ENV === 'production',
    level: 'debug',
  },
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: schema,
  }),
  secondaryStorage: {
    get: async key => {
      const value = await redis.get(key);
      return value ? value : null;
    },
    set: async (key, value, ttl) => {
      if (ttl) await redis.set(key, value, { EX: ttl });
      // or for ioredis:
      // if (ttl) await redis.set(key, value, 'EX', ttl)
      else await redis.set(key, value);
    },
    delete: async key => {
      await redis.del(key);
    },
  },
  socialProviders: {
    microsoft: {
      clientId: MICROSOFT_CLIENT_ID || '',
      clientSecret: MICROSOFT_CLIENT_SECRET || '',
      tenantId: MICROSOFT_TENANT_ID || '',
      scope: [
        'email',
        'offline_access',
        'openid',
        'profile',
        'User.Read',
        'GroupMember.Read.All',
        'ProfilePhoto.Read.All',
        'User.ReadBasic.All',
      ],
    },
  },
  session: {
    freshAge: 0,
    expiresIn: 60 * 60 * 24 * 3, // 3 days
    updateAge: 60 * 60 * 12, // 12 hours (every 12 hours the session expiration is updated)
    // Cookie settings for session data caching (minimal data)
    cookieCache: {
      //enabled: true, // Re-enabled since we've optimized session data size
      enabled: false, // Disable for now until we confirm session data size is small enough
    },
    // BetterAuth falls back to database storage for large session data
  },
  advanced: {
    // Use secure cookies in all environments
    useSecureCookies: process.env.NODE_ENV === 'production',
    // Default attributes for all cookies
    defaultCookieAttributes: {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    },
  },
  user: {
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
    },
    additionalFields: {
      originalRoles: {
        type: 'string[]',
        required: false,
        input: false,
      },
      isImpersonating: {
        type: 'boolean',
        required: false,
        defaultValue: false,
        input: false,
      },
      groups: {
        type: 'string[]',
        required: false,
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    admin({
      adminRoles: ['admin'],
      impersonationSessionDuration: 60 * 60, // 1 hour
      impersonationPermission: (user: User & { role?: string }) =>
        user.role === ROLES.ADMIN || user.role === ROLES.SECURITY,
    }),
    apiKey(),
    jwt(),
    openAPI(),
  ],
} satisfies BetterAuthOptions;
