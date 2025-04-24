'use client';

import { useAdmin as useAdminBase } from '@/lib/auth/client';
import { authLogger } from '@/lib/logger';
import type { UserFilterOptions, UserStats } from '@/types/admin';
import type { User } from '@/types/auth';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook for accessing admin plugin functionality
 * Provides type-safe methods for user management with loading state and error handling
 */
export function useAdmin() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const adminBase = useAdminBase();

  /**
   * Fetch users with optional filtering
   */
  const getUsers = useCallback(
    async (options?: UserFilterOptions): Promise<User[] | null> => {
      setIsLoading(true);
      try {
        // Using the base admin client from Phase 1
        const result = await adminBase.getUsers();
        return result;
      } catch (error) {
        toast.error('Failed to fetch users');
        authLogger.error('Error fetching users:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [adminBase]
  );

  /**
   * Get a specific user by ID
   */
  const getUserById = useCallback(
    async (id: string): Promise<User | null> => {
      setIsLoading(true);
      try {
        const result = await adminBase.getUserById(id);
        return result;
      } catch (error) {
        toast.error('Failed to fetch user');
        authLogger.error(`Error fetching user ${id}:`, error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [adminBase]
  );

  /**
   * Update a user's information
   */
  const updateUser = useCallback(
    async (id: string, data: Partial<User>): Promise<User | null> => {
      setIsLoading(true);
      try {
        // @ts-expect-error - Will be properly implemented when admin plugin is added
        const result = await adminBase.updateUser(id, data);
        toast.success('User updated successfully');
        return result;
      } catch (error) {
        toast.error('Failed to update user');
        authLogger.error(`Error updating user ${id}:`, error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [adminBase]
  );

  /**
   * Delete a user
   */
  const deleteUser = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        // @ts-expect-error - Will be properly implemented when admin plugin is added
        await adminBase.deleteUser(id);
        toast.success('User deleted successfully');
        return true;
      } catch (error) {
        toast.error('Failed to delete user');
        authLogger.error(`Error deleting user ${id}:`, error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [adminBase]
  );

  /**
   * Get user statistics
   */
  const getUserStats = useCallback(async (): Promise<UserStats | null> => {
    setIsLoading(true);
    try {
      const result = await adminBase.getUserStats();
      return result;
    } catch (error) {
      toast.error('Failed to fetch user statistics');
      authLogger.error('Error fetching user statistics:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [adminBase]);

  return {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserStats,
    isLoading,
  };
}
