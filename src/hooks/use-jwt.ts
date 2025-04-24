'use client';

import { useJwt as useJwtBase } from '@/lib/auth/client';
import { authLogger } from '@/lib/logger';
import type { JwtPayload } from '@/types/plugins';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook for accessing JWT plugin functionality
 * Provides type-safe methods for JWT token management with loading state and error handling
 */
export function useJwt() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const jwtBase = useJwtBase();

  /**
   * Generate a new JWT token with the provided payload
   */
  const generateToken = useCallback(
    async (payload: JwtPayload): Promise<string | null> => {
      setIsLoading(true);
      try {
        const result = await jwtBase.generateToken(payload);
        return result;
      } catch (error) {
        toast.error('Failed to generate JWT token');
        authLogger.error('Error generating JWT token:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [jwtBase]
  );

  /**
   * Verify a JWT token and return its payload if valid
   */
  const verifyToken = useCallback(
    async (token: string): Promise<JwtPayload | null> => {
      setIsLoading(true);
      try {
        const result = await jwtBase.verifyToken(token);
        return result;
      } catch (error) {
        toast.error('Invalid JWT token');
        authLogger.error('Error verifying JWT token:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [jwtBase]
  );

  /**
   * Refresh a JWT token and return the new token with its expiration
   */
  const refreshToken = useCallback(
    async (token: string): Promise<{ token: string; expires: Date } | null> => {
      setIsLoading(true);
      try {
        const result = await jwtBase.refreshToken(token);
        return result;
      } catch (error) {
        toast.error('Failed to refresh JWT token');
        authLogger.error('Error refreshing JWT token:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [jwtBase]
  );

  return {
    generateToken,
    verifyToken,
    refreshToken,
    isLoading,
  };
}
