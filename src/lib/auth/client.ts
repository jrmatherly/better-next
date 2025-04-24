import { createAuthClient } from 'better-auth/react';
import { env } from '../../env';
import type {
  AdminClientMethods,
  ApiKeyClientMethods,
  JwtClientMethods,
  OrganizationClientMethods,
  UserStats,
  ApiKey,
  ApiKeyCreateParams,
  JwtPayload,
  Organization,
  OrganizationCreateParams,
  OrganizationInviteParams
} from '@/types/plugins';
import type { User } from '@/types/auth';

// Create the base auth client
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  // Plugin configurations will be added in a future implementation
});

// Export standard auth functions
export const {
  signIn,
  signOut,
  signUp,
  updateUser,
  changePassword,
  changeEmail,
  deleteUser,
  useSession,
  revokeSession,
  getSession,
  resetPassword,
  sendVerificationEmail,
  linkSocial,
  forgetPassword,
  verifyEmail,
  listAccounts,
  listSessions,
  revokeOtherSessions,
  revokeSessions,
} = authClient;

// Create stable admin client that won't change between renders
// This is a module-level constant that won't be recreated on each hook call
const stableAdminClient = {
  // Admin placeholder functions
  getUsers: async (): Promise<User[]> => [],
  getUserById: async (id: string): Promise<User | null> => null,
  getUserStats: async (): Promise<UserStats> => ({
    totalUsers: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newUsersThisWeek: 0,
    newUsersThisMonth: 0,
  }),
  deleteUser: async (id: string): Promise<void> => {},
  updateUser: async (id: string, data: Partial<User>): Promise<User | null> => null,
};

// Export typed plugin accessors
export const getAdminClient = (): AdminClientMethods => {
  // @ts-expect-error - Will be properly implemented when plugin is added
  return authClient.admin || {};
};

// Placeholder hooks
export const useAdmin = () => {
  return stableAdminClient;
};

export const getApiKeyClient = (): ApiKeyClientMethods => {
  // @ts-expect-error - Will be properly implemented when plugin is added
  return authClient.apiKey || {};
};

export const getJwtClient = (): JwtClientMethods => {
  // @ts-expect-error - Will be properly implemented when plugin is added
  return authClient.jwt || {};
};

export const getOrganizationClient = (): OrganizationClientMethods => {
  // @ts-expect-error - Will be properly implemented when plugin is added
  return authClient.organization || {};
};

export const useApiKeys = () => {
  return {
    // API Key placeholder functions
    getKeys: async (): Promise<ApiKey[]> => [],
    createKey: async (data: ApiKeyCreateParams): Promise<ApiKey | null> => null,
    deleteKey: async (id: string): Promise<void> => {},
  };
};

export const useJwt = () => {
  return {
    // JWT placeholder functions
    generateToken: async (payload: JwtPayload): Promise<string | null> => null,
    verifyToken: async (token: string): Promise<JwtPayload | null> => null,
    refreshToken: async (token: string): Promise<{ token: string; expires: Date } | null> => null,
  };
};

export const useOrganizations = () => {
  return {
    // Organization placeholder functions
    getOrganizations: async (): Promise<Organization[]> => [],
    createOrganization: async (data: OrganizationCreateParams): Promise<Organization | null> => null,
    inviteUser: async (data: OrganizationInviteParams): Promise<{ invitation: string } | null> => null,
  };
};
