/**
 * Role styling utility for consistent role-based UI styling
 * Contains mappings for badges, colors, and other role-specific UI elements
 */

import { ROLES } from '@/types/roles';

/**
 * Badge variant and color styles for different user roles
 * Used for consistent visual representation of roles across the application
 */
export const roleStyleMap: Record<string, { variant: 'destructive' | 'secondary', className: string }> = {
  [ROLES.ADMIN]: { variant: 'destructive', className: '' },
  [ROLES.SECURITY]: { variant: 'secondary', className: 'bg-purple-500' },
  [ROLES.DEVOPS]: { variant: 'secondary', className: 'bg-blue-500' },
  [ROLES.DBA]: { variant: 'secondary', className: 'bg-green-500' },
  [ROLES.TCC]: { variant: 'secondary', className: 'bg-orange-500' },
  [ROLES.FIELDTECH]: { variant: 'secondary', className: 'bg-yellow-500' },
  'endpoint': { variant: 'secondary', className: 'bg-pink-500' },
  [ROLES.COLLAB]: { variant: 'secondary', className: 'bg-teal-500' },
  [ROLES.USER]: { variant: 'secondary', className: '' },
};

/**
 * Gets appropriate badge styling for a user role
 * @param role The user's role
 * @returns An object with variant and className properties for styling
 */
export function getRoleBadgeStyles(role: string | undefined) {
  if (!role) return { variant: 'secondary' as const, className: '' };
  return roleStyleMap[role] || { variant: 'secondary' as const, className: '' };
}

/**
 * Gets text color class based on user role
 * @param role The user's role
 * @returns A Tailwind text color class name
 */
export function getRoleTextColor(role: string | undefined): string {
  if (!role) return '';
  
  const roleColorMap: Record<string, string> = {
    [ROLES.ADMIN]: 'text-destructive',
    [ROLES.SECURITY]: 'text-purple-500',
    [ROLES.DEVOPS]: 'text-blue-500',
    [ROLES.DBA]: 'text-green-500',
    [ROLES.TCC]: 'text-orange-500',
    [ROLES.FIELDTECH]: 'text-yellow-500',
    'endpoint': 'text-pink-500',
    [ROLES.COLLAB]: 'text-teal-500',
  };
  
  return roleColorMap[role] || '';
}
