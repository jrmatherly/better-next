import { PrismaClient } from '@prisma/client';
import type { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { 
  admin, 
  apiKey, 
  jwt, 
  openAPI, 
  organization 
} from 'better-auth/plugins';

const APP_NAME =
  process.env.NODE_ENV === 'development'
    ? `DEV - ${process.env.NEXT_PUBLIC_APP_NAME}`
    : process.env.NEXT_PUBLIC_APP_NAME;

const prisma = new PrismaClient();

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
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
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
    // Disable cookie cache to prevent session data size issues with Microsoft auth
    cookieCache: {
      enabled: false, // Disabled to prevent "Session data too large" errors with Microsoft SSO
    },
    // BetterAuth automatically uses the database when cookieCache is disabled
  },
  user: {
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
    },
    // Add schema extensions for RBAC and impersonation
    additionalFields: {
      // String array for roles (admin, security, devops, etc.)
      roles: {
        type: 'string[]',
        required: false,
        defaultValue: ['user'],
        input: false, // Admin-only field, not user settable
      },
      // For impersonation support
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
      // For Azure AD groups
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
    // Admin plugin for user and session management
    admin(),
    
    // API Key plugin for secure API access
    apiKey(),
    
    // JWT plugin for token-based authentication
    jwt(),
    
    // Organization plugin for multi-tenant support
    organization(),
    
    // OpenAPI plugin for API documentation
    openAPI(),
  ],
} satisfies BetterAuthOptions;
