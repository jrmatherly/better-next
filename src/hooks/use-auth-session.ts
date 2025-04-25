'use client';

/**
 * Client-side hook for accessing the current authentication session
 * Used for components that need to react to session changes
 */

import { authClient } from '@/lib/auth/client';
import type { ExtendedSession } from '@/types/auth';
import { useCallback, useEffect, useState } from 'react';

interface UseAuthSessionReturn {
  /** The current authenticated session */
  session: ExtendedSession | null;
  /** Whether the session is currently loading */
  isLoading: boolean;
  /** Force refresh the session */
  refresh: () => Promise<void>;
}

/**
 * Hook to access the current auth session on the client side
 * @returns The current session, loading state, and refresh function
 */
export function useAuthSession(): UseAuthSessionReturn {
  const [session, setSession] = useState<ExtendedSession | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Function to load the session - using useCallback to allow it as a dependency
  const loadSession = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      const currentSession = await authClient.getSession();

      // Safe type assertion after checking structure
      if (
        currentSession &&
        typeof currentSession === 'object' &&
        'user' in currentSession &&
        currentSession.user
      ) {
        setSession(currentSession as unknown as ExtendedSession);
      } else {
        setSession(null);
      }
    } catch (error) {
      console.error('Failed to load session:', error);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load session on component mount
  useEffect(() => {
    loadSession();
  }, [loadSession]);

  // Function to manually refresh the session
  const refresh = async (): Promise<void> => {
    await loadSession();
  };

  return {
    session,
    isLoading,
    refresh,
  };
}
