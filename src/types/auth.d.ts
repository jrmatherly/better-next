import { auth } from '@/lib/auth/server';
import type { Role } from '@/types/roles';
import type { ReactNode } from 'react';

/**
 * Session data structure explicitly defined for clarity
 * This matches the structure returned by BetterAuth but makes it more explicit
 */
export interface SessionData {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  expiresAt: Date;
  token: string;
  fresh: boolean;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Microsoft profile interface for OAuth provider data
 * Used for handling Microsoft-specific claims and groups
 */
export interface MicrosoftProfile {
  groups?: string[];
  roles?: string[];
  email?: string;
  name?: string;
}

/**
 * Extended token type for JWT
 * Used in the jwt callback to handle custom token data
 */
export interface AuthToken {
  id?: string;
  email?: string;
  name?: string | null;
  picture?: string | null;
  image?: string | null;
  sub?: string;
  roles?: string[] | Role[];
  groups?: string[];
  isImpersonating?: boolean;
  originalRoles?: string[] | Role[];
  iat?: number;
  exp?: number;
  jti?: string;
}

/**
 * Extended session type with our custom fields
 * Used to type the session object in client and server code
 */
export type ExtendedSession = typeof auth.$Infer.Session & {
  user: typeof auth.$Infer.User & {
    roles?: Role[];
    groups?: string[];
    originalRoles?: Role[];
    isImpersonating?: boolean;
  };
};

/**
 * Props for components that conditionally render based on roles
 */
export interface RoleAccessProps {
  /**
   * List of roles that are allowed to access the content
   */
  allowedRoles: Role[];

  /**
   * The content to show if the user has the required roles
   */
  children: ReactNode;

  /**
   * Optional fallback content for unauthorized users
   */
  fallback?: ReactNode;

  /**
   * If true, the user must have all specified roles
   * Default is false (any role is sufficient)
   */
  requireAll?: boolean;
}

// Add role information to the existing BetterAuth User type
declare module '@/lib/auth/server' {
  interface User {
    roles?: Role[];
    groups?: string[];
    originalRoles?: Role[];
    isImpersonating?: boolean;
  }
}
