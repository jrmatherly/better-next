import { authLogger } from '@/lib/logger';
import { type ProtectOptions } from '@/types/auth';
import { ROLES, type Role } from '@/types/roles';
import { redirect } from 'next/navigation';
import { getServerSession } from './guards';

/**
 * Higher-order function to protect server components with role-based access
 *
 * @param Component The server component to protect
 * @param allowedRoles Roles that are allowed to access this component
 * @param options Configuration options
 */
export function withRoleProtection<T>(
  Component: (props: T) => Promise<React.ReactNode> | React.ReactNode,
  allowedRoles: Role[],
  options: ProtectOptions = {}
) {
  const {
    redirectTo = '/unauthorized',
    requireAll = false,
    fallbackMessage,
  } = options;

  return async function ProtectedComponent(props: T) {
    // Get the user's session
    const session = await getServerSession();

    // Not authenticated, redirect to sign in
    if (!session?.user) {
      authLogger.info(
        'Unauthenticated access attempt to protected component - redirecting to sign in'
      );
      redirect('/login');
    }

    // Check if user has the required role
    const userRole = session.user.role || '';

    // Has access when either:
    // 1. requireAll is true and the single allowed role matches the user's role
    // 2. requireAll is false and the user's role is included in allowedRoles
    const hasAccess = requireAll
      ? allowedRoles.length === 1 && allowedRoles[0] === userRole
      : allowedRoles.includes(userRole as Role);

    // If no access, redirect to unauthorized page
    if (!hasAccess) {
      authLogger.warn(
        `Unauthorized access attempt by user ${session.user.email} with role ${userRole} ` +
          `to component requiring roles: ${allowedRoles.join(', ')}`
      );
      redirect(redirectTo);
    }

    // Render the component if the user has access
    return Component(props);
  };
}

/**
 * Protect a server component with admin-only access
 *
 * @param Component The server component to protect
 * @param options Configuration options
 */
export function withAdminProtection<T>(
  Component: (props: T) => Promise<React.ReactNode> | React.ReactNode,
  options: Omit<ProtectOptions, 'requireAll'> = {}
) {
  return withRoleProtection(Component, [ROLES.ADMIN], options);
}

/**
 * Protect a page that requires authentication but no specific role
 *
 * @param Component The server component to protect
 */
export function withAuthProtection<T>(
  Component: (props: T) => Promise<React.ReactNode> | React.ReactNode,
  options: Omit<ProtectOptions, 'requireAll'> = {}
) {
  return async function AuthProtectedComponent(props: T) {
    // Get the user's session
    const session = await getServerSession();

    // Not authenticated, redirect to sign in
    if (!session?.user) {
      authLogger.info(
        'Unauthenticated access attempt to protected component - redirecting to sign in'
      );

      const redirectTo = options.redirectTo || '/login';
      redirect(redirectTo);
    }

    // Render the component if the user is authenticated
    return Component(props);
  };
}

/**
 * Protect a server component with security role access
 * Allows both admin and security roles
 *
 * @param Component The server component to protect
 * @param options Configuration options
 */
export function withSecurityProtection<T>(
  Component: (props: T) => Promise<React.ReactNode> | React.ReactNode,
  options: Omit<ProtectOptions, 'requireAll'> = {}
) {
  return withRoleProtection(Component, [ROLES.ADMIN, ROLES.SECURITY], options);
}

/**
 * Protect a server component with DevOps role access
 * Allows both admin and devops roles
 *
 * @param Component The server component to protect
 * @param options Configuration options
 */
export function withDevOpsProtection<T>(
  Component: (props: T) => Promise<React.ReactNode> | React.ReactNode,
  options: Omit<ProtectOptions, 'requireAll'> = {}
) {
  return withRoleProtection(Component, [ROLES.ADMIN, ROLES.DEVOPS], options);
}

/**
 * Protect a server component with Database Admin role access
 * Allows both admin and dba roles
 *
 * @param Component The server component to protect
 * @param options Configuration options
 */
export function withDBAProtection<T>(
  Component: (props: T) => Promise<React.ReactNode> | React.ReactNode,
  options: Omit<ProtectOptions, 'requireAll'> = {}
) {
  return withRoleProtection(Component, [ROLES.ADMIN, ROLES.DBA], options);
}

/**
 * Protect a server component with Collaboration role access
 * Allows both admin and collab roles
 *
 * @param Component The server component to protect
 * @param options Configuration options
 */
export function withCollabProtection<T>(
  Component: (props: T) => Promise<React.ReactNode> | React.ReactNode,
  options: Omit<ProtectOptions, 'requireAll'> = {}
) {
  return withRoleProtection(Component, [ROLES.ADMIN, ROLES.COLLAB], options);
}

/**
 * Protect a server component with TCC role access
 * Allows admin, fieldtech, and tcc roles
 *
 * @param Component The server component to protect
 * @param options Configuration options
 */
export function withTCCProtection<T>(
  Component: (props: T) => Promise<React.ReactNode> | React.ReactNode,
  options: Omit<ProtectOptions, 'requireAll'> = {}
) {
  return withRoleProtection(
    Component,
    [ROLES.ADMIN, ROLES.FIELDTECH, ROLES.TCC],
    options
  );
}

/**
 * Protect a server component with Field Technician role access
 * Allows both admin and fieldtech roles
 *
 * @param Component The server component to protect
 * @param options Configuration options
 */
export function withFieldTechProtection<T>(
  Component: (props: T) => Promise<React.ReactNode> | React.ReactNode,
  options: Omit<ProtectOptions, 'requireAll'> = {}
) {
  return withRoleProtection(Component, [ROLES.ADMIN, ROLES.FIELDTECH], options);
}
