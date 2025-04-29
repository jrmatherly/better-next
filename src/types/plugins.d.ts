import type { User } from '@/types/auth';
import type { Role } from '@/types/roles';
import type { UserStats } from '@/types/admin';

/**
 * Common types used by BetterAuth plugins
 */
export type FetchOptions = {
  method?: string;
  headers?: Record<string, string>;
  cache?: RequestCache;
  referrerPolicy?: ReferrerPolicy;
  credentials?: RequestCredentials;
  mode?: RequestMode;
  redirect?: RequestRedirect;
  signal?: AbortSignal;
  disableValidation?: boolean;
  [key: string]: unknown;
};

/**
 * Admin plugin type definitions
 * These match the actual BetterAuth admin plugin implementation
 */
export interface AdminClientMethods {
  /**
   * List users with pagination and filtering
   * Uses BetterAuth's native parameter structure
   */
  listUsers(
    params?: AdminListUsersParams,
    options?: FetchOptions
  ): Promise<AdminListUsersResponse>;
  
  /**
   * Get a specific user by ID
   */
  getUserById?(id: string): Promise<User | null>;
  
  /**
   * Update a user's information
   */
  updateUser?(id: string, data: Partial<User>): Promise<User>;
  
  /**
   * Delete a user
   */
  deleteUser?(id: string): Promise<void>;
  
  /**
   * Get user statistics
   */
  getUserStats?(): Promise<UserStats>;
}

/**
 * Utility type to clean up complex types
 */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

/**
 * Parameters for listing users as expected by BetterAuth
 */
export interface AdminListUsersParams {
  query?: {
    searchValue?: string;
    searchField?: "email" | "name";
    searchOperator?: "contains" | "starts_with" | "ends_with";
    limit?: string | number;
    page?: string | number;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
    filter?: Record<string, unknown>;
    filterOperator?: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "in";
  };
  fetchOptions?: FetchOptions;
}

/**
 * Response from listing users
 */
export interface AdminListUsersResponse {
  users: User[];
  total: number;
  page: number;
  pageCount: number;
  hasMore: boolean;
}

/**
 * API Key plugin type definitions
 * These match the actual BetterAuth API Key plugin implementation
 */
export interface ApiKeyClientMethods {
  /**
   * Create a new API key
   */
  create?(
    params?: ApiKeyClientCreateParams,
    options?: FetchOptions
  ): Promise<{ data: ApiKey; error: Error | null }>;
  
  /**
   * List API keys
   */
  list?(
    params?: Record<string, unknown>,
    options?: FetchOptions
  ): Promise<{ data: ApiKey[]; error: Error | null }>;
  
  /**
   * Delete an API key
   */
  delete?(
    params: { keyId: string },
    options?: FetchOptions
  ): Promise<{ data: { success: boolean }; error: Error | null }>;
  
  /**
   * Validate an API key
   */
  validate?(
    key: string,
    options?: FetchOptions
  ): Promise<{ valid: boolean; error: { message: string; code: string } | null; key: Omit<ApiKey, "value"> | null }>;
}

/**
 * API Key client create parameters as expected by BetterAuth
 */
export interface ApiKeyClientCreateParams {
  metadata?: unknown;
  name?: string;
  userId?: string;
  prefix?: string;
  expiresIn?: number | null;
  permissions?: Record<string, string[]>;
  description?: string;
  enablePersonalApiKey?: boolean;
  disablePersonalApiKey?: boolean;
  limit?: number;
  remaining?: number | null;
}

/**
 * API Key model
 */
export interface ApiKey {
  /**
   * Unique identifier for the API key
   */
  id: string;
  
  /**
   * Human-readable name for the API key
   */
  name: string;
  
  /**
   * The actual API key value - referred to as 'key' in some BetterAuth responses
   */
  value?: string;
  
  /**
   * Alternative field name used in some BetterAuth responses
   */
  key?: string;
  
  /**
   * Prefix displayed to identify the API key
   */
  prefix?: string;
  
  /**
   * Beginning portion of the key used for visual identification
   */
  start?: string;
  
  /**
   * When the API key was created
   */
  createdAt: Date;
  
  /**
   * When the API key expires (if applicable)
   */
  expiresAt?: Date | null;
  
  /**
   * When the API key was last used
   */
  lastUsed?: Date | null;
  
  /**
   * Optional description
   */
  description?: string;
  
  /**
   * User who created the API key
   */
  userId?: string;
  
  /**
   * Optional permissions associated with the API key
   */
  permissions?: Record<string, string[]>;
  
  /**
   * Whether the API key is enabled
   */
  enabled?: boolean;
  
  /**
   * Remaining uses for the API key
   */
  remaining?: number | null;
  
  /**
   * Amount to refill the API key by
   */
  refillAmount?: number | null;
  
  /**
   * Interval to refill the API key
   */
  refillInterval?: number | null;
  
  /**
   * Whether rate limiting is enabled for the API key
   */
  rateLimitEnabled?: boolean;
  
  /**
   * Time window for rate limiting
   */
  rateLimitTimeWindow?: number;
  
  /**
   * Maximum rate limit
   */
  rateLimitMax?: number;
}

/**
 * Parameters for creating an API key
 */
export interface ApiKeyCreateParams {
  /**
   * Human-readable name for the API key
   */
  name: string;
  
  /**
   * When the API key expires (if applicable)
   */
  expiresAt?: Date;
  
  /**
   * User the API key belongs to (admin only)
   */
  userId?: string;
  
  /**
   * Optional description
   */
  description?: string;
  
  /**
   * Optional permissions to associate with the API key
   */
  permissions?: Record<string, string[]>;
}

/**
 * JWT plugin type definitions
 * These match the actual BetterAuth JWT plugin implementation
 */
export interface JwtClientMethods {
  /**
   * Generate a new JWT token with the specified payload
   */
  generate?(
    payload: JwtPayload,
    options?: FetchOptions
  ): Promise<string>;
  
  /**
   * Verify and decode a token
   */
  verify?(
    token: string,
    options?: FetchOptions
  ): Promise<JwtPayload | null>;
  
  /**
   * Refresh a token
   */
  refresh?(
    token: string,
    options?: FetchOptions
  ): Promise<{ token: string; expires: Date } | null>;
}

/**
 * JWT payload type
 */
export interface JwtPayload {
  /**
   * Subject of the token (usually user ID)
   */
  sub: string;
  
  /**
   * Token issued at timestamp
   */
  iat?: number;
  
  /**
   * Token expiration timestamp
   */
  exp?: number;
  
  /**
   * Audience
   */
  aud?: string;
  
  /**
   * Issuer
   */
  iss?: string;
  
  /**
   * User roles
   */
  roles?: Role[];
  
  /**
   * User's full name
   */
  name?: string;
  
  /**
   * User's email
   */
  email?: string;
  
  /**
   * Custom claims
   */
  [key: string]: unknown;
}

/**
 * Organization plugin type definitions
 */
export interface OrganizationClientMethods {
  /**
   * Create a new organization
   */
  createOrganization: (data: OrganizationCreateParams) => Promise<Organization | null>;
  
  /**
   * Get a list of organizations
   */
  getOrganizations: () => Promise<Organization[]>;
  
  /**
   * Get a specific organization by ID
   */
  getOrganizationById: (id: string) => Promise<Organization | null>;
  
  /**
   * Invite a user to an organization
   */
  inviteUser: (data: OrganizationInviteParams) => Promise<{ invitation: string } | null>;
  
  /**
   * Accept an invitation to join an organization
   */
  acceptInvitation: (token: string) => Promise<{ organization: Organization } | null>;
}

/**
 * Organization model
 */
export interface Organization {
  /**
   * Unique identifier for the organization
   */
  id: string;
  
  /**
   * Name of the organization
   */
  name: string;
  
  /**
   * URL-friendly identifier
   */
  slug?: string;
  
  /**
   * When the organization was created
   */
  createdAt: Date;
  
  /**
   * When the organization was last updated
   */
  updatedAt: Date;
  
  /**
   * Current user's role in the organization
   */
  role?: string;
  
  /**
   * Number of members in the organization
   */
  memberCount?: number;
  
  /**
   * Owner of the organization
   */
  ownerId?: string;
  
  /**
   * Organization-specific settings
   */
  settings?: Record<string, unknown>;
}

/**
 * Parameters for creating an organization
 */
export interface OrganizationCreateParams {
  /**
   * Name of the organization
   */
  name: string;
  
  /**
   * URL-friendly identifier (optional, will be generated if not provided)
   */
  slug?: string;
  
  /**
   * Owner of the organization (defaults to current user)
   */
  ownerId?: string;
  
  /**
   * Organization-specific settings
   */
  settings?: Record<string, unknown>;
}

/**
 * Parameters for inviting a user to an organization
 */
export interface OrganizationInviteParams {
  /**
   * ID of the organization to invite to
   */
  organizationId: string;
  
  /**
   * Email of the user to invite
   */
  email: string;
  
  /**
   * Role to assign to the invited user
   */
  role?: string;
  
  /**
   * How long the invitation should be valid for (in seconds)
   */
  expiresIn?: number;
  
  /**
   * Custom message to include in the invitation
   */
  message?: string;
}

/**
 * Context interface for the auth provider
 */
export interface AuthContextType {
  /**
   * Whether the user is authenticated
   */
  isAuthenticated: boolean;
  
  /**
   * Whether authentication state is being loaded
   */
  isLoading: boolean;
  
  /**
   * The authenticated user, if any
   */
  user: User | null;
  
  /**
   * Error during authentication, if any
   */
  error?: Error | null;

  /**
   * The user's current role
   */
  userRole?: string;

  /**
   * The user's original role (before impersonation)
   */
  originalRole?: string;

  /**
   * Whether the user is currently impersonating another role
   */
  isImpersonating?: boolean;

  /**
   * Check if the user has a specific role
   */
  hasRole?: (role: Role | string) => boolean;

  /**
   * Check if the user has any of the specified roles
   */
  hasAnyRole?: (roles: (Role | string)[]) => boolean;

  /**
   * Check if the user has all of the specified roles
   * With singular role model, this is true only if there's exactly one role in the list
   * and it matches the user's role
   */
  hasAllRoles?: (roles: (Role | string)[]) => boolean;
}
