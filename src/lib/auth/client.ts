import type { auth } from '@/lib/auth/server';
import { apiLogger } from '@/lib/logger';
import type { UserStats } from '@/types/admin';
import type { User } from '@/types/auth';
import type {
  AdminClientMethods,
  ApiKey,
  ApiKeyClientMethods,
  ApiKeyCreateParams,
  JwtClientMethods,
  JwtPayload,
} from '@/types/plugins';
import {
  adminClient,
  apiKeyClient,
  inferAdditionalFields,
  jwtClient,
  multiSessionClient,
} from 'better-auth/client/plugins';
import { createAuthClient } from 'better-auth/react';
import { toast } from 'sonner';
import { env } from '../../env';

// Create the base auth client
export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  plugins: [
    adminClient(),
    apiKeyClient(),
    jwtClient(),
    multiSessionClient(),
    inferAdditionalFields<typeof auth>(),
  ],
  fetchOptions: {
    onError(e) {
      if (e.error.status === 429) {
        toast.error('Too many requests. Please try again later.');
      }
    },
  },
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
  /* organization,
	useListOrganizations,
	useActiveOrganization, */
} = authClient;

authClient.$store.listen('$sessionSignal', async () => {});

// Export typed plugin accessors
export const getAdminClient = (): AdminClientMethods => {
  // Use type assertion to match our interface definition
  return authClient.admin as unknown as AdminClientMethods;
};

export const getApiKeyClient = (): ApiKeyClientMethods => {
  // Use type assertion to match our interface definition
  return authClient.apiKey as unknown as ApiKeyClientMethods;
};

export const getJwtClient = (): JwtClientMethods => {
  // Use type assertion to match our interface definition
  return (authClient as Record<string, unknown>)
    .jwt as unknown as JwtClientMethods;
};

/* export const getMultiSessionClient = (): MultiSessionClientMethods => {
  // @ts-expect-error - Will be properly implemented when plugin is added
  return authClient.multiSession || {};
}; */

// Placeholder hooks
export const useAdmin = () => {
  return {
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
  };
};

export const useApiKeys = () => {
  const apiKeyClient = getApiKeyClient();

  return {
    getKeys: async (): Promise<ApiKey[]> => {
      try {
        if (!apiKeyClient.list) {
          apiLogger.warn('API key list method not available');
          return [];
        }

        const { data, error } = await apiKeyClient.list();

        if (error) {
          apiLogger.error('Error fetching API keys:', error);
          return [];
        }

        if (!data || !Array.isArray(data)) {
          apiLogger.warn('Unexpected API key list response format:', data);
          return [];
        }

        return data;
      } catch (error) {
        apiLogger.error('Error fetching API keys:', error);
        return [];
      }
    },

    createKey: async (data: ApiKeyCreateParams): Promise<ApiKey | null> => {
      try {
        if (!apiKeyClient.create) {
          apiLogger.warn('API key create method not available');
          return null;
        }

        const name = data.name || '';
        const params: Record<string, unknown> = {
          name,
          expiresIn: data.expiresAt
            ? Math.floor((data.expiresAt.getTime() - Date.now()) / 1000)
            : null,
          description: data.description,
          permissions: data.permissions,
        };

        apiLogger.debug('Creating API key with params:', params);
        const response = await apiKeyClient.create(params);

        if (response.error) {
          apiLogger.error('Error creating API key:', response.error);
          return null;
        }

        // Enhanced response debugging for future reference
        apiLogger.debug(
          'API key creation response structure:',
          JSON.stringify(response, (key, value) =>
            typeof value === 'string' && key === 'key' ? '[REDACTED]' : value
          )
        );

        // The response structure varies based on BetterAuth's implementation
        // Attempt to extract the key from various possible locations

        // Case 1: Key is directly in response.data
        if (response.data) {
          const apiKey = response.data;

          // Check if response.data has the key field
          if (apiKey.key || apiKey.value) {
            return {
              ...apiKey,
              value: apiKey.key || apiKey.value,
            };
          }

          // Check if it's using the BetterAuth v2 format where key is nested
          const apiKeyData = response.data as unknown as Record<
            string,
            unknown
          >;
          if (
            typeof apiKeyData === 'object' &&
            apiKeyData !== null &&
            'apiKey' in apiKeyData
          ) {
            const nestedKey = apiKeyData.apiKey as Record<string, unknown>;
            if (nestedKey.key || nestedKey.value) {
              return {
                id: nestedKey.id as string,
                name: nestedKey.name as string,
                createdAt: new Date(),
                value: (nestedKey.key || nestedKey.value) as string,
              };
            }
          }
        }

        // If we got this far but don't have a key, log the error but still return any data we have
        apiLogger.warn(
          'Created API key but no key value was extracted from response'
        );

        if (response.data) {
          return {
            ...response.data,
            value: undefined, // Explicitly mark that we don't have the value
          };
        }

        return null;
      } catch (error) {
        apiLogger.error('Error creating API key:', error);
        return null;
      }
    },

    deleteKey: async (id: string): Promise<boolean> => {
      try {
        if (!apiKeyClient.delete) {
          apiLogger.warn('API key delete method not available');
          return false;
        }

        apiLogger.debug(`Attempting to delete API key: ${id}`);
        const response = await apiKeyClient.delete({ keyId: id });

        if (response.error) {
          apiLogger.error(`Error deleting API key ${id}:`, response.error);
          return false;
        }

        return response.data?.success || false;
      } catch (error) {
        apiLogger.error(`Error deleting API key ${id}:`, error);
        return false;
      }
    },

    validateKey: async (key: string): Promise<boolean> => {
      try {
        if (!apiKeyClient.validate) {
          apiLogger.warn('API key validate method not available');
          return false;
        }

        const response = await apiKeyClient.validate(key);

        if (response.error) {
          apiLogger.error('Error validating API key:', response.error);
          return false;
        }

        return response.valid || false;
      } catch (error) {
        apiLogger.error('Error validating API key:', error);
        return false;
      }
    },
  };
};

export const useJwt = () => {
  return {
    // JWT placeholder functions
    generateToken: async (payload: JwtPayload): Promise<string | null> => null,
    verifyToken: async (token: string): Promise<JwtPayload | null> => null,
    refreshToken: async (
      token: string
    ): Promise<{ token: string; expires: Date } | null> => null,
  };
};
