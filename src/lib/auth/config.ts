import { env } from '@/env';
import { APP_NAME } from '@/lib/settings';
import { PrismaClient } from '@prisma/client';
import type { BetterAuthOptions } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { openAPI } from 'better-auth/plugins';

const prisma = new PrismaClient();

export const authConfig = {
  appName: APP_NAME,
  baseURL: env.NEXT_PUBLIC_APP_URL,
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
  logger: {
    disabled: process.env.NODE_ENV === 'production',
    level: 'debug',
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  session: {
    freshAge: 0,
    expiresIn: 60 * 60 * 24 * 3, // 3 days
    updateAge: 60 * 60 * 12, // 12 hours (every 12 hours the session expiration is updated)
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 minutes
    },
  },
  user: {
    changeEmail: {
      enabled: true,
    },
    deleteUser: {
      enabled: true,
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [openAPI()],
} satisfies BetterAuthOptions;
