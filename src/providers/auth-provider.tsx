'use client';

import { useSession as useBetterAuthSession } from '@/lib/auth/client';
import { type Role } from '@/types/roles';
import { type ReactNode } from 'react';
import { createContext, useCallback, useContext } from 'react';
import type { AuthContextType } from '@/types/plugins';
import type { User } from '@/types/auth';

// Create a context for auth-related functions and state
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  userRole: 'user',
  originalRole: '',
  isImpersonating: false,
  hasRole: () => false,
  hasAnyRole: () => false,
  hasAllRoles: () => false,
});

/**
 * Auth Provider component that wraps the application to provide authentication context
 * This provider makes all auth functions and plugin features available to child components
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  // Use the session from BetterAuth client
  const { data: session, isPending } = useBetterAuthSession();
  
  // Parse auth information into a consistent format
  const isAuthenticated = !!session?.user;
  const isLoading = isPending;
  const user = session?.user as User | null || null;
  
  // Role-related properties
  const userRole = session?.user?.role || 'user';
  // Type safe approach to access extended session properties
  const originalRole = (session?.user as User & { originalRole?: string })?.originalRole || '';
  const isImpersonating = !!(session?.user as User & { isImpersonating?: boolean })?.isImpersonating;
  
  // Role checking methods
  const hasRole = useCallback(
    (role: Role | string) => userRole === role,
    [userRole]
  );
  
  const hasAnyRole = useCallback(
    (roles: (Role | string)[]) => roles.includes(userRole as Role | string),
    [userRole]
  );
  
  const hasAllRoles = useCallback(
    (roles: (Role | string)[]) => 
      roles.length === 1 && roles[0] === userRole,
    [userRole]
  );
  
  // Context value with auth state
  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    userRole,
    originalRole,
    isImpersonating,
    hasRole,
    hasAnyRole,
    hasAllRoles,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to access auth context
export const useAuth = () => useContext(AuthContext);
