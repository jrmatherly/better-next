'use client';

import { useSession as useBetterAuthSession } from '@/lib/auth/client';
import { type ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { AuthContextType } from '@/types/plugins';
import type { User } from '@/types/auth';

// Create a context for auth-related functions and state
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
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
  
  // Context value with auth state
  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to access auth context
export const useAuth = () => useContext(AuthContext);
