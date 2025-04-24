'use client';

import { useAdmin as useAdminBase } from '@/lib/auth/client';
import { authLogger } from '@/lib/logger';
import type { UserFilterOptions, UserStats } from '@/types/admin';
import type { User } from '@/types/auth';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

// Define the expected shape of the admin client
interface AdminClient {
  getUsers: () => Promise<User[]>;
  getUserById: (id: string) => Promise<User | null>;
  getUserStats: () => Promise<UserStats>;
  deleteUser?: (id: string) => Promise<void>;
  updateUser?: (id: string, data: Partial<User>) => Promise<User | null>;
}

/**
 * Hook for accessing admin plugin functionality
 * Provides type-safe methods for user management with loading state and error handling
 */
export function useAdmin() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Get the base admin client - do NOT use this directly in dependencies
  const adminBase = useAdminBase() as AdminClient;
  
  // Use useMemo to create stable references to the underlying functions
  // We do this once rather than recreating functions on each render
  const stableAdminFunctions = useMemo(() => {
    return {
      getUsersBase: adminBase.getUsers,
      getUserByIdBase: adminBase.getUserById,
      getUserStatsBase: adminBase.getUserStats,
      // Use optional chaining for functions that might not exist yet
      deleteUserBase: adminBase.deleteUser ?? (async (id: string) => {
        throw new Error('Delete user not implemented');
      }),
      updateUserBase: adminBase.updateUser ?? (async (id: string, data: Partial<User>) => {
        throw new Error('Update user not implemented');
      }),
    };
  }, [adminBase]); // We can safely use adminBase as a dependency since we're only capturing its methods once

  /**
   * Fetch users with optional filtering
   */
  const getUsers = useCallback(
    async (options?: UserFilterOptions): Promise<User[] | null> => {
      setIsLoading(true);
      try {
        // Using the stable reference to getUsers to prevent recreation on each render
        const result = await stableAdminFunctions.getUsersBase();
        return result;
      } catch (error) {
        toast.error('Failed to fetch users');
        authLogger.error('Error fetching users:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [stableAdminFunctions]
  );

  /**
   * Get a specific user by ID
   */
  const getUserById = useCallback(
    async (id: string): Promise<User | null> => {
      setIsLoading(true);
      try {
        const result = await stableAdminFunctions.getUserByIdBase(id);
        return result;
      } catch (error) {
        toast.error('Failed to fetch user');
        authLogger.error(`Error fetching user ${id}:`, error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [stableAdminFunctions]
  );

  /**
   * Update a user
   */
  const updateUser = useCallback(
    async (id: string, data: Partial<User>): Promise<User | null> => {
      setIsLoading(true);
      try {
        const result = await stableAdminFunctions.updateUserBase(id, data);
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
    [stableAdminFunctions]
  );

  /**
   * Delete a user
   */
  const deleteUser = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        await stableAdminFunctions.deleteUserBase?.(id);
        toast.success('User deleted');
        return true;
      } catch (error) {
        toast.error('Failed to delete user');
        authLogger.error(`Error deleting user ${id}:`, error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [stableAdminFunctions]
  );

  /**
   * Get user statistics
   */
  const getUserStats = useCallback(
    async (): Promise<UserStats | null> => {
      setIsLoading(true);
      try {
        const result = await stableAdminFunctions.getUserStatsBase();
        return result;
      } catch (error) {
        toast.error('Failed to fetch user statistics');
        authLogger.error('Error fetching user statistics:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [stableAdminFunctions]
  );

  return {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserStats,
    isLoading,
  };
}
