/**
 * Hook for managing user impersonation
 * Provides methods for starting and stopping impersonation sessions
 * with proper loading state and error handling
 */

import { getAdminClient } from '@/lib/auth/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { useAuthSession } from './use-auth-session';

// Extend the AdminClientMethods type to include impersonation methods
interface AdminImpersonationMethods {
  impersonateUser: (params: { userId: string }) => Promise<void>;
  stopImpersonating: () => Promise<void>;
}

interface UseImpersonationReturn {
  /** Start impersonating a specific user */
  impersonateUser: (userId: string) => Promise<void>;
  /** Stop impersonating and return to admin account */
  stopImpersonating: () => Promise<void>;
  /** Whether an impersonation action is in progress */
  isLoading: boolean;
}

/**
 * Hook for managing user impersonation
 * @returns Methods for impersonation management and loading state
 */
export function useImpersonation(): UseImpersonationReturn {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const adminClient = getAdminClient();
  const { refresh: refreshSession } = useAuthSession();

  /**
   * Start impersonating a user by ID
   * @param userId - ID of the user to impersonate
   */
  const impersonateUser = async (userId: string): Promise<void> => {
    try {
      setIsLoading(true);
      // Cast to include the impersonation methods that are available in BetterAuth
      const adminWithImpersonation =
        adminClient as unknown as AdminImpersonationMethods;
      await adminWithImpersonation.impersonateUser({ userId });

      // Refresh auth session to update UI with impersonation state
      await refreshSession();

      toast.success('Impersonation started', {
        description: 'You are now viewing the application as the selected user',
      });

      // Redirect to user profile and refresh routes
      router.push('/user/profile');
      router.refresh();
    } catch (error) {
      toast.error('Impersonation failed', {
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
      console.error('Error starting impersonation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Stop impersonating and return to admin account
   */
  const stopImpersonating = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Cast to include the impersonation methods that are available in BetterAuth
      const adminWithImpersonation =
        adminClient as unknown as AdminImpersonationMethods;
      await adminWithImpersonation.stopImpersonating();

      // Refresh auth session to update UI with impersonation state
      await refreshSession();

      toast.success('Returned to admin account', {
        description: 'Impersonation session ended',
      });

      // Redirect to admin dashboard and refresh routes
      router.push('/admin');
      router.refresh();
    } catch (error) {
      toast.error('Error ending impersonation', {
        description:
          error instanceof Error ? error.message : 'An unknown error occurred',
      });
      console.error('Error stopping impersonation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    impersonateUser,
    stopImpersonating,
    isLoading,
  };
}
