import { parseRoles } from '@/lib/auth/role-utils';
import { authLogger } from '@/lib/logger';
import type { ExtendedSession } from '@/types/auth.d';
import { ROLES } from '@/types/roles';

/**
 * Session enhancement hook for BetterAuth
 *
 * This hook enhances the session with role information from the Microsoft token.
 * When a user signs in via Microsoft, their app roles from Azure AD are extracted
 * and added to the session. If no roles are found, a default user role is assigned.
 */
export const enhanceSession = async ({
  session,
  token,
}: {
  session: ExtendedSession;
  token: Record<string, unknown>;
}): Promise<ExtendedSession> => {
  if (!session?.user) {
    return session;
  }

  // Extract roles from token (should come in the roles claim)
  const userRoles = parseRoles(token?.roles);

  // If no valid roles were assigned, set default role
  if (userRoles.length === 0) {
    userRoles.push(ROLES.USER);
  }

  // Optionally extract and store groups if needed for other purposes
  const userGroups = Array.isArray(token?.groups)
    ? token.groups.filter(
        (group: unknown): group is string => typeof group === 'string'
      )
    : [];

  // Log role assignment for debugging (using authLogger instead of console)
  if (process.env.NODE_ENV !== 'production') {
    authLogger.debug('[Auth] Assigned roles:', userRoles);
    if (userGroups.length > 0) {
      authLogger.debug('[Auth] User groups:', userGroups);
    }
  }

  // Return enhanced session with roles (and optionally groups)
  return {
    ...session,
    user: {
      ...session.user,
      role: userRoles[0] || 'user',
      ...(userGroups.length > 0 && { groups: userGroups }),
    },
  };
};
