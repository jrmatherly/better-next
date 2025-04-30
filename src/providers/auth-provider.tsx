'use client';

import { getSession } from '@/lib/auth/client';
import type { User } from '@/types/auth';
import type { AuthContextType } from '@/types/plugins';
import { type Role } from '@/types/roles';
import { type ReactNode } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

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
  // State for session data
  const [session, setSession] = useState<{ user?: User | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch session data using getSession for better performance
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setIsLoading(true);
        const result = await getSession();

        if (result?.data) {
          setSession({
            user: result.data.user as User | null,
          });
        } else {
          setSession(null);
        }
      } catch (error) {
        console.error('Error fetching auth session:', error);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Execute immediately with high priority
    fetchSessionData();
    
    // Force a session refresh when pathname changes (after login/navigation)
    const handleRouteChange = () => {
      // Use requestAnimationFrame for better UI responsiveness
      requestAnimationFrame(() => {
        fetchSessionData();
      });
    };
    
    // Add event listeners to detect navigation changes
    window.addEventListener('popstate', handleRouteChange);
    
    // Track URL changes more aggressively
    let lastUrl = window.location.href;
    const detectUrlChanges = setInterval(() => {
      const currentUrl = window.location.href;
      if (currentUrl !== lastUrl) {
        lastUrl = currentUrl;
        handleRouteChange();
      }
    }, 100); // Check frequently
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      clearInterval(detectUrlChanges);
    };
  }, []);

  // Parse auth information into a consistent format
  const isAuthenticated = !!session?.user;
  const user = (session?.user as User | null) || null;

  // Role-related properties
  const userRole = session?.user?.role || 'user';
  // Type safe approach to access extended session properties
  const originalRole =
    (session?.user as User & { originalRole?: string })?.originalRole || '';
  const isImpersonating = !!(
    session?.user as User & { isImpersonating?: boolean }
  )?.isImpersonating;

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
    (roles: (Role | string)[]) => roles.length === 1 && roles[0] === userRole,
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to access auth context
export const useAuth = () => useContext(AuthContext);
