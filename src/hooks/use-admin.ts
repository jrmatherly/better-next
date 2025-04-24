'use client';

import { authClient } from '@/lib/auth/client';
import { authLogger } from '@/lib/logger';
import type { UserFilterOptions, UserStats } from '@/types/admin';
import type { User } from '@/types/auth';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'sonner';

/**
 * BetterAuth response type definitions
 */
interface BetterAuthListUsersResponse {
  users: User[];
  total: number;
  limit?: number;
  offset?: number;
}

/**
 * Admin client interface to improve type safety
 */
interface BetterAuthAdminClient {
  listUsers: (options: { query: Record<string, unknown> }) => Promise<unknown>;
  getUser: (options: { userId: string }) => Promise<unknown>;
  updateUser: (options: { userId: string; data: Partial<User> }) => Promise<unknown>;
  removeUser: (options: { userId: string }) => Promise<unknown>;
}

/**
 * Hook for accessing admin plugin functionality
 * Provides type-safe methods for user management with loading state and error handling
 */
export function useAdmin() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Access the admin client with proper type casting
  const adminClient = useMemo<BetterAuthAdminClient>(() => {
    // Cast to Record first to access properties more safely without 'any'
    const client = authClient as Record<string, unknown>;
    return client.admin as BetterAuthAdminClient;
  }, []);

  /**
   * Handles unknown response type safely
   */
  const extractUserData = useCallback(<T,>(response: unknown): T | null => {
    if (!response) return null;
    
    // Cast to a Record type for safer property access
    const result = response as Record<string, unknown>;
    
    // Handle error responses using optional chaining
    if (result?.error) {
      console.error('Error in API response:', result.error);
      return null;
    }
    
    // Handle data property using optional chaining
    if (result?.data) {
      return result.data as T;
    }
    
    // Return the result directly
    return result as T;
  }, []);

  /**
   * Fetch users with optional filtering
   */
  const getUsers = useCallback(
    async (options?: UserFilterOptions): Promise<User[] | null> => {
      setIsLoading(true);
      try {
        // Check if admin client methods exist
        if (!adminClient?.listUsers) {
          console.error('Admin plugin not properly initialized');
          return [];
        }
        
        const result = await adminClient.listUsers({
          query: {
            limit: options?.limit || 100,
            offset: options?.page
              ? (options.page - 1) * (options?.limit || 20)
              : 0,
            ...(options?.search && { searchValue: options.search }),
            ...(options?.role &&
              options.role !== 'all' && {
                filterField: 'role',
                filterOperator: 'eq',
                filterValue: options.role,
              }),
          },
        });

        // Extract response data safely
        const responseData = extractUserData<BetterAuthListUsersResponse>(result);
        
        // If we have a valid response with users array, return it
        if (responseData?.users && Array.isArray(responseData.users)) {
          return responseData.users;
        }
        
        // If we have a raw users array, return it
        const resultObj = result as Record<string, unknown>;
        if (resultObj?.users && Array.isArray(resultObj.users)) {
          return resultObj.users as User[];
        }
        
        // Default empty array if nothing was found
        return [];
      } catch (error) {
        toast.error('Failed to fetch users');
        authLogger.error('Error fetching users:', error);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [adminClient, extractUserData]
  );

  /**
   * Get a specific user by ID
   */
  const getUserById = useCallback(
    async (id: string): Promise<User | null> => {
      setIsLoading(true);
      try {
        // Check if admin client methods exist
        if (!adminClient?.getUser) {
          console.error('Admin plugin not properly initialized');
          return null;
        }
        
        const result = await adminClient.getUser({ userId: id });
        return extractUserData<User>(result);
      } catch (error) {
        toast.error('Failed to fetch user');
        authLogger.error(`Error fetching user ${id}:`, error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [adminClient, extractUserData]
  );

  /**
   * Update a user's information
   */
  const updateUser = useCallback(
    async (id: string, data: Partial<User>): Promise<User | null> => {
      setIsLoading(true);
      try {
        // Check if admin client methods exist
        if (!adminClient?.updateUser) {
          console.error('Admin plugin not properly initialized');
          return null;
        }
        
        const result = await adminClient.updateUser({ 
          userId: id, 
          data
        });
        
        const updatedUser = extractUserData<User>(result);
        
        if (updatedUser) {
          toast.success('User updated successfully');
          return updatedUser;
        }
        
        return null;
      } catch (error) {
        toast.error('Failed to update user');
        authLogger.error(`Error updating user ${id}:`, error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [adminClient, extractUserData]
  );

  /**
   * Delete a user
   */
  const deleteUser = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        // Check if admin client methods exist
        if (!adminClient?.removeUser) {
          console.error('Admin plugin not properly initialized');
          return false;
        }
        
        await adminClient.removeUser({ userId: id });
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
    [adminClient]
  );

  /**
   * Get user statistics
   */
  const getUserStats = useCallback(async (): Promise<UserStats | null> => {
    setIsLoading(true);
    try {
      // Check if admin client methods exist
      if (!adminClient?.listUsers) {
        console.error('Admin plugin not properly initialized');
        return null;
      }
      
      // Get user count from the list users API
      const result = await adminClient.listUsers({
        query: { limit: 1 }
      });
      
      // Extract total count
      let totalUsers = 0;
      
      const responseData = extractUserData<BetterAuthListUsersResponse>(result);
      if (responseData?.total) {
        totalUsers = responseData.total;
      } else {
        const resultObj = result as Record<string, unknown>;
        if (typeof resultObj?.total === 'number') {
          totalUsers = resultObj.total;
        }
      }
      
      // Create statistics
      const stats: UserStats = {
        totalUsers,
        activeUsers: totalUsers, // We don't have exact active user info
        newUsersToday: 0,        // Would need creation dates for this
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
      };
      
      return stats;
    } catch (error) {
      toast.error('Failed to fetch user statistics');
      authLogger.error('Error fetching user statistics:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [adminClient, extractUserData]);

  return {
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
    getUserStats,
    isLoading,
  };
}
