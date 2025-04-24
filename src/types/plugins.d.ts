import type { User } from '@/types/auth';
import type { Role } from '@/types/roles';

/**
 * Admin plugin type definitions
 */
export interface AdminClientMethods {
  /**
   * Get a list of users with optional filtering
   */
  getUsers: () => Promise<User[]>;
  
  /**
   * Get a specific user by ID
   */
  getUserById: (id: string) => Promise<User | null>;
  
  /**
   * Update a user's information
   */
  updateUser: (id: string, data: Partial<User>) => Promise<User>;
  
  /**
   * Delete a user
   */
  deleteUser: (id: string) => Promise<void>;
  
  /**
   * Get user statistics
   */
  getUserStats: () => Promise<UserStats>;
}

/**
 * User statistics information
 */
export interface UserStats {
  /**
   * Total number of users in the system
   */
  totalUsers: number;
  
  /**
   * Number of active users (logged in within last 30 days)
   */
  activeUsers: number;
  
  /**
   * Number of new users registered today
   */
  newUsersToday: number;
  
  /**
   * Number of new users registered this week
   */
  newUsersThisWeek: number;
  
  /**
   * Number of new users registered this month
   */
  newUsersThisMonth: number;
}

/**
 * API Key plugin type definitions
 */
export interface ApiKeyClientMethods {
  /**
   * Create a new API key
   */
  createKey: (data: ApiKeyCreateParams) => Promise<ApiKey | null>;
  
  /**
   * Get all API keys for the current user
   */
  getKeys: () => Promise<ApiKey[]>;
  
  /**
   * Delete an API key
   */
  deleteKey: (id: string) => Promise<void>;
  
  /**
   * Validate an API key
   */
  validateKey: (key: string) => Promise<boolean>;
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
   * User-friendly name for the API key
   */
  name: string;
  
  /**
   * The actual API key value (only available on creation)
   */
  value?: string;
  
  /**
   * When the API key was created
   */
  createdAt: Date;
  
  /**
   * When the API key expires (null if never)
   */
  expiresAt?: Date | null;
  
  /**
   * When the API key was last used
   */
  lastUsed?: Date | null;
}

/**
 * Parameters for creating an API key
 */
export interface ApiKeyCreateParams {
  /**
   * User-friendly name for the API key
   */
  name: string;
  
  /**
   * When the API key should expire
   */
  expiresAt?: Date;
  
  /**
   * The user ID to associate the key with (defaults to current user)
   */
  userId?: string;
  
  /**
   * Description of the API key's purpose
   */
  description?: string;
}

/**
 * JWT plugin type definitions
 */
export interface JwtClientMethods {
  /**
   * Generate a new JWT token
   */
  generateToken: (payload: JwtPayload) => Promise<string | null>;
  
  /**
   * Verify a JWT token
   */
  verifyToken: (token: string) => Promise<JwtPayload | null>;
  
  /**
   * Refresh a JWT token
   */
  refreshToken: (token: string) => Promise<{ token: string; expires: Date } | null>;
}

/**
 * JWT payload type
 */
export interface JwtPayload {
  /**
   * Subject (usually user ID)
   */
  sub: string;
  
  /**
   * Issued at timestamp
   */
  iat?: number;
  
  /**
   * Expiration timestamp
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
   * Additional custom claims
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
   * Get all organizations the current user belongs to
   */
  getOrganizations: () => Promise<Organization[]>;
  
  /**
   * Get an organization by ID
   */
  getOrganizationById: (id: string) => Promise<Organization | null>;
  
  /**
   * Invite a user to an organization
   */
  inviteUser: (data: OrganizationInviteParams) => Promise<{ invitation: string } | null>;
  
  /**
   * Accept an organization invitation
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
   * Organization name
   */
  name: string;
  
  /**
   * URL-friendly slug
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
   * The user's role in this organization
   */
  role?: string;
  
  /**
   * Number of members in the organization
   */
  memberCount?: number;
}

/**
 * Parameters for creating an organization
 */
export interface OrganizationCreateParams {
  /**
   * Organization name
   */
  name: string;
  
  /**
   * URL-friendly slug (optional, will be generated if not provided)
   */
  slug?: string;
  
  /**
   * User ID of the organization owner
   */
  ownerId?: string;
}

/**
 * Parameters for inviting a user to an organization
 */
export interface OrganizationInviteParams {
  /**
   * Organization ID to invite the user to
   */
  organizationId: string;
  
  /**
   * Email address of the user to invite
   */
  email: string;
  
  /**
   * Role to assign to the invited user
   */
  role?: string;
  
  /**
   * Invitation expiration time in seconds
   */
  expiresIn?: number;
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
   * Whether authentication state is loading
   */
  isLoading: boolean;
  
  /**
   * Current user information if authenticated
   */
  user: User | null;
}
