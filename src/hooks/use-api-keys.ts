'use client';

import { useApiKeys as useApiKeysBase } from '@/lib/auth/client';
import { apiLogger } from '@/lib/logger';
import type { ApiKey, ApiKeyCreateParams } from '@/types/plugins';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook for accessing API key plugin functionality
 * Provides type-safe methods for API key management with loading state and error handling
 */
export function useApiKeys() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const apiKeysBase = useApiKeysBase();

  /**
   * Get all API keys for the current user
   */
  const getKeys = useCallback(async (): Promise<ApiKey[]> => {
    setIsLoading(true);
    try {
      const result = await apiKeysBase.getKeys();
      return result;
    } catch (error) {
      toast.error('Failed to fetch API keys');
      apiLogger.error('Error fetching API keys:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [apiKeysBase]);

  /**
   * Create a new API key
   */
  const createKey = useCallback(
    async (data: ApiKeyCreateParams): Promise<ApiKey | null> => {
      setIsLoading(true);
      try {
        const result = await apiKeysBase.createKey(data);
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
    [apiKeysBase]
  );

  /**
   * Delete an API key
   */
  const deleteKey = useCallback(
    async (id: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        await apiKeysBase.deleteKey(id);
        toast.success('API key deleted successfully');
        return true;
      } catch (error) {
        toast.error('Failed to delete API key');
        apiLogger.error(`Error deleting API key ${id}:`, error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [apiKeysBase]
  );

  /**
   * Validate an API key
   */
  const validateKey = useCallback(
    async (key: string): Promise<boolean> => {
      setIsLoading(true);
      try {
        // @ts-expect-error - Will be properly implemented when API key plugin is added
        const isValid = await apiKeysBase.validateKey(key);
        return isValid;
      } catch (error) {
        toast.error('Failed to validate API key');
        apiLogger.error('Error validating API key:', error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [apiKeysBase]
  );

  return {
    getKeys,
    createKey,
    deleteKey,
    validateKey,
    isLoading,
  };
}
