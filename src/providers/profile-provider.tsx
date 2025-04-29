'use client';

import { updateUser, useSession, getSession } from '@/lib/auth/client';
import { authLogger } from '@/lib/logger';
import type { Profile, ProfileContextType } from '@/types/profile';
import { useRouter } from 'next/navigation';
import { createContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Create the profile context for managing user profile data
 */
export const ProfileContext = createContext<ProfileContextType | undefined>(
  undefined
);

/**
 * Maps BetterAuth user data to Profile interface
 * Handles the extended schema fields and deserializes complex objects
 *
 * @param session BetterAuth session
 * @param existingProfile Optional existing profile data to merge with
 * @returns Profile object
 */
export function mapSessionToProfile(
  // Using a more precise type definition based on BetterAuth structure
  session: {
    user?: {
      id?: string;
      name?: string | null;
      email: string;
      image?: string | null;
      role?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      phone?: string | null;
      jobTitle?: string | null;
      company?: string | null;
      location?: string | null;
      preferences?: string | null;
      socialLinks?: string | null;
      additionalFields?: {
        firstName?: string | null;
        lastName?: string | null;
        phone?: string | null;
        jobTitle?: string | null;
        company?: string | null;
        location?: string | null;
        preferences?: string | null;
        socialLinks?: string | null;
      };
      data?: {
        firstName?: string | null;
        lastName?: string | null;
        phone?: string | null;
        jobTitle?: string | null;
        company?: string | null;
        location?: string | null;
        preferences?: string | null;
        socialLinks?: string | null;
      };
    } | null;
  } | null,
  existingProfile?: Partial<Profile>
): Profile {
  if (!session?.user) {
    // Fallback to minimal profile if no session
    return {
      firstName: existingProfile?.firstName || '',
      lastName: existingProfile?.lastName || '',
      email: existingProfile?.email || '',
      memberSince:
        existingProfile?.memberSince ||
        new Date().toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }),
      ...existingProfile,
    } as Profile;
  }

  // Extract user data from session
  const user = session.user;

  // Special handling for additionalFields in BetterAuth
  // Some fields might be directly on the user object or nested in a data/additionalFields property
  // Here we look in all possible locations to find our extended fields
  let firstName = user.firstName ?? '';
  let lastName = user.lastName ?? '';
  let phone = user.phone ?? '';
  let jobTitle = user.jobTitle ?? '';
  let company = user.company ?? '';
  let location = user.location ?? '';
  let preferencesStr = user.preferences ?? null;
  let socialLinksStr = user.socialLinks ?? null;

  // Check if there's an additionalFields object where the data might be stored
  if (user.additionalFields) {
    // Extended fields in additionalFields
    firstName = user.additionalFields.firstName ?? firstName;
    lastName = user.additionalFields.lastName ?? lastName;
    phone = user.additionalFields.phone ?? phone;
    jobTitle = user.additionalFields.jobTitle ?? jobTitle;
    company = user.additionalFields.company ?? company;
    location = user.additionalFields.location ?? location;
    preferencesStr = user.additionalFields.preferences ?? preferencesStr;
    socialLinksStr = user.additionalFields.socialLinks ?? socialLinksStr;
  }

  // BetterAuth sometimes puts extended fields under a data property
  if (user.data) {
    // Extended fields in data
    firstName = user.data.firstName ?? firstName;
    lastName = user.data.lastName ?? lastName;
    phone = user.data.phone ?? phone;
    jobTitle = user.data.jobTitle ?? jobTitle;
    company = user.data.company ?? company;
    location = user.data.location ?? location;
    preferencesStr = user.data.preferences ?? preferencesStr;
    socialLinksStr = user.data.socialLinks ?? socialLinksStr;
  }

  // Parse name into first/last name if available
  // Either use the extended schema fields directly, or fall back to parsing from the name field
  if (user.name && !firstName && !lastName) {
    // Handle "Lastname, Firstname" format from social providers
    if (user.name.includes(',')) {
      const [lastNamePart, firstNamePart] = user.name
        .split(',')
        .map(part => part.trim());
      firstName = firstNamePart || '';
      lastName = lastNamePart || '';
    } else {
      // Handle regular "Firstname Lastname" format
      const nameParts = user.name.split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    }
  }

  // Parse preferences JSON if available
  let preferences = existingProfile?.preferences;
  if (preferencesStr) {
    try {
      preferences = JSON.parse(preferencesStr);
    } catch (err) {
      authLogger.error('Error parsing preferences JSON:', err);
    }
  }

  // Parse socialLinks JSON if available
  let socialLinks = existingProfile?.socialLinks;
  if (socialLinksStr) {
    try {
      socialLinks = JSON.parse(socialLinksStr);
    } catch (err) {
      authLogger.error('Error parsing socialLinks JSON:', err);
    }
  }

  return {
    firstName,
    lastName,
    email: user.email,
    avatarUrl: user.image || existingProfile?.avatarUrl,
    memberSince:
      existingProfile?.memberSince ||
      new Date().toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      }),
    preferences: preferences || {
      emailNotifications: true,
      marketingEmails: false,
      securityAlerts: true,
      productUpdates: true,
      twoFactorAuth: false,
      sessionTimeout: false,
      dataSharing: true,
    },
    socialLinks: socialLinks || {},
    phone: phone || existingProfile?.phone || '',
    jobTitle: jobTitle || existingProfile?.jobTitle || '',
    company: company || existingProfile?.company || '',
    location: location || existingProfile?.location || '',
  };
}

/**
 * Provider component for user profile data
 * Uses BetterAuth session and integrates with existing authentication system
 */
export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, isPending } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Initialize profile data from session when it becomes available
  useEffect(() => {
    if (!isPending) {
      try {
        // Get session data from the client-side hook
        if (session) {
          // For initial quick load, use basic session data from useSession
          const basicProfile = mapSessionToProfile(session);
          setProfile(basicProfile);
          
          // Then fetch the complete user data using getSession()
          // This will include all extended fields from the database
          getSession().then(fullSessionData => {
            authLogger.debug('Complete session data from getSession():', fullSessionData);
            
            // Check for data property structure from BetterAuth's getSession()
            if (fullSessionData?.data?.user) {
              // Convert returned data to the expected format for mapSessionToProfile
              const fullSession = { user: fullSessionData.data.user };
              
              // Map the full session data to our profile structure
              const fullProfile = mapSessionToProfile(fullSession);
              setProfile(fullProfile);
            }
          }).catch(error => {
            authLogger.error('Error fetching complete session data:', error);
          });
          
          setError(null);
        } else {
          // No session yet, use minimal profile
          const mappedProfile = mapSessionToProfile(null);
          setProfile(mappedProfile);
        }
      } catch (err) {
        setError('Failed to load profile data');
        authLogger.error('Profile mapping error:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [session, isPending]);

  /**
   * Update profile data using BetterAuth's updateUser function
   * With extended schema support for all profile fields
   */
  const updateProfile = async (data: Partial<Profile>): Promise<boolean> => {
    if (!profile) return false;

    setIsLoading(true);

    try {
      // Create updateData object for BetterAuth
      const updateData: Record<string, unknown> = {};

      // Map name fields (still using core BetterAuth name field)
      if (data.firstName || data.lastName) {
        const firstName = data.firstName || profile.firstName;
        const lastName = data.lastName || profile.lastName;
        updateData.name = `${firstName} ${lastName}`.trim();
      }

      // Map avatar/image (still using core BetterAuth image field)
      if (data.avatarUrl) {
        updateData.image = data.avatarUrl;
      }

      // Map extended fields directly
      if (data.firstName !== undefined) {
        updateData.firstName = data.firstName;
      }

      if (data.lastName !== undefined) {
        updateData.lastName = data.lastName;
      }

      if (data.phone !== undefined) {
        updateData.phone = data.phone;
      }

      if (data.jobTitle !== undefined) {
        updateData.jobTitle = data.jobTitle;
      }

      if (data.company !== undefined) {
        updateData.company = data.company;
      }

      if (data.location !== undefined) {
        updateData.location = data.location;
      }

      // Handle complex objects by serializing to JSON strings
      if (data.preferences) {
        updateData.preferences = JSON.stringify(data.preferences);
      }

      if (data.socialLinks) {
        updateData.socialLinks = JSON.stringify(data.socialLinks);
      }

      // Call updateUser with our prepared data
      await updateUser(updateData, {
        onSuccess: () => {
          // Update local profile state
          setProfile(prev => (prev ? { ...prev, ...data } : null));
          router.refresh();
        },
        onError: err => {
          setError(err.error.message || 'Failed to update profile');
          toast.error(err.error.message || 'Failed to update profile');
        },
      });

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Only render children when profile is loaded
  if (isLoading && !profile) {
    return <div className="p-8 text-center">Loading profile...</div>;
  }

  return (
    <ProfileContext.Provider
      value={{
        profile: profile as Profile,
        updateProfile,
        isLoading,
        error,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
