import { ROLES, type Role } from '@/types/roles';

/**
 * Type guard to check if a value is a valid Role
 */
export function isValidRole(role: string): role is Role {
  return Object.values(ROLES).includes(role as Role);
}

/**
 * Parse roles from token data, ensuring type safety
 * Returns an array of valid roles, or [ROLES.USER] if no valid roles are found
 */
export function parseRoles(tokenRoles: unknown): Role[] {
  // Handle non-array input
  if (!Array.isArray(tokenRoles)) {
    return [ROLES.USER]; // Default to basic user role
  }

  // Filter for valid string roles that match our ROLES enum
  const validRoles = tokenRoles
    .filter((role): role is string => typeof role === 'string')
    .filter(isValidRole);

  // Return the valid roles, or default to USER role if none found
  return validRoles.length > 0 ? validRoles : [ROLES.USER];
}

/**
 * Check if a user has a specific role
 */
export function hasRole(roles: Role[] | undefined, role: Role): boolean {
  return Array.isArray(roles) && roles.includes(role);
}

/**
 * Check if a user has any of the specified roles
 */
export function hasAnyRole(
  roles: Role[] | undefined,
  allowedRoles: Role[]
): boolean {
  return (
    Array.isArray(roles) && roles.some(role => allowedRoles.includes(role))
  );
}

/**
 * Get the highest priority role from a list of roles
 * Uses a simple priority hierarchy with ADMIN at the top
 */
export function getHighestRole(roles: Role[] | undefined): Role {
  if (!Array.isArray(roles) || roles.length === 0) {
    return ROLES.USER;
  }

  // Role priority (highest to lowest)
  const rolePriority: Role[] = [
    ROLES.ADMIN,
    ROLES.SECURITY,
    ROLES.DEVOPS,
    ROLES.DBA,
    ROLES.COLLAB,
    ROLES.TCC,
    ROLES.FIELDTECH,
    ROLES.USER,
  ];

  // Find the first role from our priority list that exists in the user's roles
  for (const priorityRole of rolePriority) {
    if (roles.includes(priorityRole)) {
      return priorityRole;
    }
  }

  return ROLES.USER;
}

// Re-export ROLES for backward compatibility and convenience
export { ROLES };
