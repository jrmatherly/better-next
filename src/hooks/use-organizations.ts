'use client';

import { useOrganizations as useOrganizationsBase } from '@/lib/auth/client';
import { authLogger } from '@/lib/logger';
import type {
  Organization,
  OrganizationCreateParams,
  OrganizationInviteParams,
} from '@/types/plugins';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';

/**
 * Hook for accessing Organization plugin functionality
 * Provides type-safe methods for organization management with loading state and error handling
 */
export function useOrganizations() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const organizationsBase = useOrganizationsBase();

  /**
   * Get all organizations the current user belongs to
   */
  const getOrganizations = useCallback(async (): Promise<Organization[]> => {
    setIsLoading(true);
    try {
      const result = await organizationsBase.getOrganizations();
      return result;
    } catch (error) {
      toast.error('Failed to fetch organizations');
      authLogger.error('Error fetching organizations:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [organizationsBase]);

  /**
   * Get a specific organization by ID
   */
  const getOrganizationById = useCallback(
    async (id: string): Promise<Organization | null> => {
      setIsLoading(true);
      try {
        // @ts-expect-error - Will be properly implemented when organization plugin is added
        const result = await organizationsBase.getOrganizationById(id);
        return result;
      } catch (error) {
        toast.error('Failed to fetch organization');
        authLogger.error(`Error fetching organization ${id}:`, error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [organizationsBase]
  );

  /**
   * Create a new organization
   */
  const createOrganization = useCallback(
    async (data: OrganizationCreateParams): Promise<Organization | null> => {
      setIsLoading(true);
      try {
        const result = await organizationsBase.createOrganization(data);
        if (result) {
          toast.success('Organization created successfully');
        }
        return result;
      } catch (error) {
        toast.error('Failed to create organization');
        authLogger.error('Error creating organization:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [organizationsBase]
  );

  /**
   * Invite a user to an organization
   */
  const inviteUser = useCallback(
    async (
      data: OrganizationInviteParams
    ): Promise<{ invitation: string } | null> => {
      setIsLoading(true);
      try {
        const result = await organizationsBase.inviteUser(data);
        if (result) {
          toast.success('Invitation sent successfully');
        }
        return result;
      } catch (error) {
        toast.error('Failed to send invitation');
        authLogger.error('Error sending invitation:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [organizationsBase]
  );

  /**
   * Accept an organization invitation
   */
  const acceptInvitation = useCallback(
    async (token: string): Promise<{ organization: Organization } | null> => {
      setIsLoading(true);
      try {
        // @ts-expect-error - Will be properly implemented when organization plugin is added
        const result = await organizationsBase.acceptInvitation(token);
        if (result) {
          toast.success('Invitation accepted successfully');
        }
        return result;
      } catch (error) {
        toast.error('Failed to accept invitation');
        authLogger.error('Error accepting invitation:', error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [organizationsBase]
  );

  return {
    getOrganizations,
    getOrganizationById,
    createOrganization,
    inviteUser,
    acceptInvitation,
    isLoading,
  };
}
