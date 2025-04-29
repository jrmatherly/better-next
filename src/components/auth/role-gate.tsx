import { useAuth } from '@/providers/auth-provider';
import { type RoleAccessProps } from '@/types/auth.d';

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
}: RoleAccessProps) {
  const { isLoading, hasAnyRole, hasAllRoles } = useAuth();
  
  // Optional handling for loading state
  if (isLoading) {
    return showFallbackOnLoading ? <>{fallback}</> : null;
  }
  
  // Check permission based on required access pattern
  const hasAccess = requireAll
    ? hasAllRoles?.(allowedRoles) ?? false
    : hasAnyRole?.(allowedRoles) ?? false;
    
  // Render based on access check
  return hasAccess ? <>{children}</> : <>{fallback}</>;
}
