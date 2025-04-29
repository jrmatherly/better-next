'use client';

/**
 * Custom hook for accessing and managing user profile data
 * Integrates with BetterAuth session and provides profile management functionality
 */
import { changeEmail, changePassword, useSession } from '@/lib/auth/client';
import { ProfileContext } from '@/providers/profile-provider';
import { useContext, useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook for accessing the profile context
 * Must be used within a ProfileProvider
 * @returns Profile context with profile data and update methods
 */
export const useProfileContext = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
};

/**
 * Hook for updating user password
 * Uses BetterAuth's changePassword function
 * @returns Password change function and loading state
 */
export const usePasswordUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update the user's password
   * @param currentPassword Current password for verification
   * @param newPassword New password to set
   * @param revokeOtherSessions Whether to revoke other sessions (default: true)
   * @returns Success status
   */
  const updatePassword = async (
    currentPassword: string,
    newPassword: string,
    revokeOtherSessions = true
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions,
      });
      
      toast.success('Password updated successfully');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update password';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updatePassword,
    isLoading,
    error,
  };
};

/**
 * Hook for updating user email
 * Uses BetterAuth's changeEmail function
 * @returns Email change function and loading state
 */
export const useEmailUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Update the user's email address
   * @param newEmail New email address
   * @param callbackURL URL to redirect to after verification (optional)
   * @returns Success status
   */
  const updateEmail = async (
    newEmail: string,
    callbackURL?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      await changeEmail({
        newEmail,
        callbackURL,
      });
      
      toast.success('Email update initiated. Check your inbox to complete the process.');
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update email';
      setError(message);
      toast.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updateEmail,
    isLoading,
    error,
  };
};

/**
 * Hook providing combined access to profile, session, and auth operations
 * @returns Combined profile and session data with update methods
 */
export const useProfile = () => {
  const { data: session, isPending: isSessionLoading } = useSession();
  const profileContext = useProfileContext();
  const passwordUpdate = usePasswordUpdate();
  const emailUpdate = useEmailUpdate();

  return {
    // Profile data and updates
    ...profileContext,

    // Auth session
    session,
    isSessionLoading,

    // Password management
    ...passwordUpdate,

    // Email management
    ...emailUpdate,

    // Loading state (combined)
    isLoading: profileContext?.isLoading || isSessionLoading,
  };
};
