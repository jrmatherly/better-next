import type { auth } from '@/lib/auth/server';
import type { ReactNode } from 'react';

/**
 * Inferred Session type directly from BetterAuth
 * This provides the most accurate and up-to-date session type definition
 */
export type InferredSession = typeof auth.$Infer.Session;
/* export type InferredActiveOrganization = typeof authClient.$Infer.ActiveOrganization;
export type InferredInvitation = typeof authClient.$Infer.Invitation; */

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
 * BetterAuth's actual session return type from getSession()
 * This matches the response structure from the BetterAuth library
 */
export interface BetterAuthSession {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role?: string;
    isImpersonating?: boolean;
    originalRole?: string;
    groups?: string[];
  };
  session?: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    impersonatedBy?: string;
  };
}

/**
 * Standard session type from BetterAuth
 * This is the main session type used throughout the application
 */
export interface Session {
  user: {
    id: string;
    name?: string | null;
    email: string;
    image?: string | null;
    role?: string;
    isImpersonating?: boolean;
    originalRole?: string;
    groups?: string[];
  };
  expires?: string;
  expiresAt?: Date;
  session?: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string | null;
    userAgent?: string | null;
    impersonatedBy?: string;
  };
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
  role?: string;
  groups?: string[];
  isImpersonating?: boolean;
  originalRole?: string;
  iat?: number;
  exp?: number;
  jti?: string;
}

/**
 * User interface for use throughout the application
 */
export interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
  role: string;
  isImpersonating?: boolean;
  originalRole?: string;
  groups?: string[];
  emailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Extended session type with our custom fields
 * Used to type the session object in client and server code
 */
export interface ExtendedSession {
  user: User & {
    role: string;
    groups?: string[];
    originalRole?: string;
    isImpersonating?: boolean;
  };
  groups?: string[];
  originalRole?: string;
  isImpersonating?: boolean;
}

/**
 * Props for components that conditionally render based on roles
 */
export interface RoleAccessProps {
  /**
   * List of roles that are allowed to access the content
   */
  allowedRoles: string[];

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

  /**
   * If true, renders a loading skeleton while checking authentication
   * If false (default), nothing is rendered during loading
   */
  showLoadingSkeleton?: boolean;

  /**
   * If true, shows the fallback content during loading
   * If false, nothing is rendered during loading
   */
  showFallbackOnLoading?: boolean;
}

/**
 * Props for the access denied alert component
 */
export interface AccessDeniedAlertProps {
  /**
   * Title for the alert
   */
  title?: string;

  /**
   * Description of why access is denied
   */
  description?: ReactNode;

  /**
   * Additional content to display below the description
   */
  children?: ReactNode;

  /**
   * Optional CSS class names
   */
  className?: string;
}

/**
 * Props for the protected layout component
 */
export interface ProtectedLayoutProps {
  /**
   * The content to render if the user has access
   */
  children: ReactNode;

  /**
   * List of roles that are allowed to access this section
   */
  allowedRoles: string[];

  /**
   * Custom title for the unauthorized view
   */
  unauthorizedTitle?: string;

  /**
   * Custom message for the unauthorized view
   */
  unauthorizedMessage?: string;

  /**
   * If true, the user must have all specified roles
   * If false (default), having any of the specified roles is sufficient
   */
  requireAll?: boolean;

  /**
   * If true, shows a loading state while checking authentication
   */
  showLoading?: boolean;
}

/**
 * Options for role-based protection of components and routes
 */
export interface ProtectOptions {
  /**
   * URL to redirect to if access is denied
   * Default: '/unauthorized'
   */
  redirectTo?: string;

  /**
   * If true, requires all specified roles instead of any one of them
   * Default: false
   */
  requireAll?: boolean;

  /**
   * Optional message to display instead of redirecting
   */
  fallbackMessage?: string;
}

// Add role information to the existing BetterAuth User type
declare module '@/lib/auth/server' {
  interface User {
    role: string;
    groups?: string[];
    originalRole?: string;
    isImpersonating?: boolean;
  }
}
