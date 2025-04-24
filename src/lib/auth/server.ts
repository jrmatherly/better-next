import { authActions } from '@/lib/auth/actions';
import { authConfig } from '@/lib/auth/config';
import { parseRoles } from '@/lib/auth/role-utils';
import type { AuthToken, MicrosoftProfile } from '@/types/auth';
import { betterAuth } from 'better-auth';
import type { Account, User as BetterAuthUser, Session } from 'better-auth';

// Create auth configuration with session enhancement
const configWithCallbacks = {
  ...authConfig,
  ...authActions,
  socialProviders: {
    ...authConfig.socialProviders,
    microsoft: {
      ...authConfig.socialProviders.microsoft,
      // Map Microsoft profile data to user model, extracting roles
      mapProfileToUser: (profile: Record<string, unknown>) => {
        // For debugging in development only
        if (process.env.NODE_ENV !== 'production') {
          // biome-ignore lint/suspicious/noConsole: allow console to prevent schema generation errors
          console.debug('[Auth] Microsoft Profile:', profile.email);
        }

        // Check all possible locations where Azure AD might store roles
        const possibleRoleClaims = [
          profile.roles,
          profile.appRoles,
          profile.wids,
          profile[
            'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
          ],
        ];

        // Find the first claim array that contains roles
        const rolesFromClaims = possibleRoleClaims.find(
          claim => Array.isArray(claim) && claim.length > 0
        );

        // Process roles if found
        if (rolesFromClaims) {
          const roles = parseRoles(rolesFromClaims);

          if (process.env.NODE_ENV !== 'production') {
            // biome-ignore lint/suspicious/noConsole: allow console to prevent schema generation errors
            console.debug('[Auth] Found roles in Microsoft claims:', roles);
          }

          // Use the highest priority role for the standard 'role' field
          return { 
            role: roles[0] || 'user',  // Use the first role as primary
          };
        }

        if (process.env.NODE_ENV !== 'production') {
          // biome-ignore lint/suspicious/noConsole: allow console to prevent schema generation errors
          console.debug(
            '[Auth] No Microsoft roles found, using default "user" role'
          );
        }

        // Default to 'user' role if no roles found
        return { 
          role: 'user',
        };
      },
    },
  },
  callbacks: {
    // This callback is used to customize the JWT token
    // Store all non-essential data here instead of in the session
    async jwt({
      token,
      account,
      user,
      profile,
    }: {
      token: AuthToken;
      account: Account | null;
      user:
        | (BetterAuthUser & {
            role?: string;
            isImpersonating?: boolean;
            originalRoles?: string[];
            groups?: string[];
          })
        | null;
      profile?: MicrosoftProfile;
    }) {
      // Initial sign-in
      if (account && user) {
        // Extract Microsoft-specific groups if available
        const msGroups = profile?.groups || [];

        // Process roles from Microsoft claims if they exist
        const msRoles = profile?.roles || [];

        return {
          ...token,
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          // Store the user's role
          role: user.role || 'user',
          // Store minimal group data (only IDs or names, not full objects)
          groups: msGroups.filter(
            (group: unknown): group is string => typeof group === 'string'
          ),
          // Impersonation state
          isImpersonating: user.isImpersonating || false,
          originalRoles: user.originalRoles || [],
        };
      }

      return token;
    },

    // This callback shapes what's stored in the session cookie
    // Keep this extremely minimal to avoid cookie size limits
    async session({
      session,
      token,
    }: {
      session: Session & Record<string, unknown>;
      token: AuthToken;
    }) {
      // Create minimal session with only essential data
      const enhancedSession = { ...session };

      return {
        ...enhancedSession,
        user: {
          id: token.id as string,
          email: token.email as string,
          name: (token.name as string) || null,
          image: (token.image as string) || null,
          // Include the user's role for authorization
          role: (token.role as string) || 'user',
          isImpersonating: !!token.isImpersonating,
          // Only include originalRoles if currently impersonating
          ...(token.isImpersonating
            ? { originalRoles: (token.originalRoles as string[]) || [] }
            : {}),
          // Only include groups if they're needed for immediate authorization
          ...(Array.isArray(token.groups) && token.groups.length > 0
            ? {
                groups: (token.groups as string[]).slice(0, 5), // Limit to top 5 groups if needed
              }
            : {}),
        },
      };
    },
  },
};

// Initialize BetterAuth with our enhanced configuration
export const auth = betterAuth(configWithCallbacks);
