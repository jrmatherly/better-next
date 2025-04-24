import { useRole } from '@/hooks/use-role';
import { type RoleGateProps } from '@/types/auth.d';

/**
 * Component for conditional rendering based on user roles
 * 
 * Use this component to show or hide UI elements based on the user's roles.
 * This is useful for building role-specific navigation, feature flags, etc.
 * 
 * @example
 * ```tsx
 * <RoleGate allowedRoles={[ROLES.ADMIN]}>
 *   <AdminControls />
 * </RoleGate>
 * ```
 */
export function RoleGate({
  allowedRoles,
  children,
  fallback,
  requireAll = false,
  showFallbackOnLoading = true,
}: RoleGateProps) {
  const { isLoading, hasAnyRole, hasAllRoles } = useRole();
  
  // Optional handling for loading state
  if (isLoading) {
    return showFallbackOnLoading ? <>{fallback}</> : null;
  }
  
  // Check permission based on required access pattern
  const hasAccess = requireAll
    ? hasAllRoles(allowedRoles)
    : hasAnyRole(allowedRoles);
    
  // Render based on access check
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
