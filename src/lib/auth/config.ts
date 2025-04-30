import { db } from '@/db';
import { ROLES } from '@/types/roles';
import type { BetterAuthOptions, User } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { admin, apiKey, jwt, multiSession, openAPI } from 'better-auth/plugins';
/* import { createClient } from 'redis'; */
import * as schema from '../../db/schema';

/* interface SecondaryStorage {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, ttl?: number) => Promise<void>;
  delete: (key: string) => Promise<void>;
}

const redis = createClient();
await redis.connect(); */

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
  /* secondaryStorage: {
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
  }, */
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
    storeSessionInDatabase: true, // Store session in database when secondary storage is provided (default: `false`)
    preserveSessionInDatabase: false, // Preserve session records in database when deleted from secondary storage (default: `false`)
  },
  advanced: {
    ipAddress: {
      ipAddressHeaders: ['x-client-ip', 'x-forwarded-for', 'remote-addr'],
      disableIpTracking: false,
    },
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
      originalRole: {
        type: 'string',
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
      firstName: {
        type: 'string',
        required: false,
        input: true,
      },
      lastName: {
        type: 'string',
        required: false,
        input: true,
      },
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
      jobTitle: {
        type: 'string',
        required: false,
        input: true,
      },
      company: {
        type: 'string',
        required: false,
        input: true,
      },
      location: {
        type: 'string',
        required: false,
        input: true,
      },
      preferences: {
        type: 'string',
        required: false,
        input: true,
      },
      socialLinks: {
        type: 'string',
        required: false,
        input: true,
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
        user.role === ROLES.ADMIN,
    }),
    apiKey(),
    jwt(),
    multiSession(),
    openAPI(),
  ],
} satisfies BetterAuthOptions;
