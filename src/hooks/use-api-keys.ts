'use client';

import { useApiKeys as useApiKeysBase } from '@/lib/auth/client';
import { apiLogger } from '@/lib/logger';
import type { ApiKey, ApiKeyCreateParams } from '@/types/plugins';
import { useCallback, useRef, useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook for accessing API key plugin functionality
 * Provides type-safe methods for API key management with loading state and error handling
 *
 * @note This hook intentionally uses a stable reference pattern to prevent infinite loops
 * in components that depend on the callback functions returned by this hook.
 */
export function useApiKeys() {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Create a stable reference to the API keys base
  const apiKeysBase = useApiKeysBase();
  const apiKeysBaseRef = useRef(apiKeysBase);

  // Keep the ref up to date with the latest apiKeysBase
  apiKeysBaseRef.current = apiKeysBase;

  /**
   * Get all API keys for the current user
   *
   * @note This function intentionally omits dependencies to prevent infinite loops
   * in useEffect hooks that consume it. It uses a ref to access the latest apiKeysBase.
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getKeys = useCallback(async (): Promise<ApiKey[]> => {
    setIsLoading(true);
    try {
      // Use the ref's current value to always access the latest apiKeysBase
      const result = await apiKeysBaseRef.current.getKeys();
      return result;
    } catch (error) {
      toast.error('Failed to fetch API keys');
      apiLogger.error('Error fetching API keys:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []); // Empty dependency array is intentional to prevent infinite loops

  /**
   * Create a new API key
   *
   * @note This function intentionally omits dependencies to prevent infinite loops
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const createKey = useCallback(
    async (data: ApiKeyCreateParams): Promise<ApiKey | null> => {
      setIsLoading(true);
      try {
        const result = await apiKeysBaseRef.current.createKey(data);
        if (result) {
          toast.success('API key created successfully');
        }
        return result;
      } catch (error) {
        toast.error('Failed to create API key');
        apiLogger.error('Error creating API key:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [] // Empty dependency array is intentional to prevent infinite loops
  );

  /**
   * Delete an API key
   *
   * @note This function intentionally omits dependencies to prevent infinite loops
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const deleteKey = useCallback(
    async (id: string): Promise<boolean> => {
      if (!apiKeysBaseRef.current) return false;
      setIsLoading(true);
      try {
        const success = await apiKeysBaseRef.current.deleteKey(id);
        if (success) {
          toast.success('API key revoked successfully');
        } else {
          toast.error('Failed to revoke API key');
          apiLogger.warn(`API key deletion failed for ID: ${id}`);
        }
        return success;
      } catch (error) {
        toast.error('Failed to revoke API key');
        apiLogger.error(`Error deleting API key ${id}:`, error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [] // Empty dependency array is intentional to prevent infinite loops
  );

  /**
   * Validate an API key
   *
   * @note This function intentionally omits dependencies to prevent infinite loops
   */
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const validateKey = useCallback(
    async (key: string): Promise<boolean> => {
      if (!apiKeysBaseRef.current) return false;

      setIsLoading(true);
      try {
        const isValid = await apiKeysBaseRef.current.validateKey(key);
        return isValid;
      } catch (error) {
        toast.error('Failed to validate API key');
        apiLogger.error('Error validating API key:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [] // Empty dependency array is intentional to prevent infinite loops
  );

  return {
    getKeys,
    createKey,
    deleteKey,
    validateKey,
    isLoading,
  };
}
