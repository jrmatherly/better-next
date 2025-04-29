'use client';

import { updateUser, useSession } from '@/lib/auth/client';
import type { Profile, ProfileContextType } from '@/types/profile';
import { useRouter } from 'next/navigation';
import { createContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Create the profile context for managing user profile data
 */
export const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

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
      memberSince: existingProfile?.memberSince || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      ...existingProfile
    } as Profile;
  }

  // Extract user data from session
  const user = session.user;
  
  // Parse name into first/last name if available
  // Either use the extended schema fields directly, or fall back to parsing from the name field
  let firstName = user.firstName || existingProfile?.firstName || '';
  let lastName = user.lastName || existingProfile?.lastName || '';
  
  if (user.name && !firstName && !lastName) {
    // Handle "Lastname, Firstname" format from social providers
    if (user.name.includes(',')) {
      const [lastNamePart, firstNamePart] = user.name.split(',').map(part => part.trim());
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
  if (user.preferences) {
    try {
      preferences = JSON.parse(user.preferences);
    } catch (err) {
      console.error('Error parsing preferences JSON:', err);
    }
  }

  // Parse socialLinks JSON if available
  let socialLinks = existingProfile?.socialLinks;
  if (user.socialLinks) {
    try {
      socialLinks = JSON.parse(user.socialLinks);
    } catch (err) {
      console.error('Error parsing socialLinks JSON:', err);
    }
  }

  return {
    firstName,
    lastName,
    email: user.email,
    avatarUrl: user.image || existingProfile?.avatarUrl,
    memberSince: existingProfile?.memberSince || 
      new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
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
    phone: user.phone || existingProfile?.phone || '',
    jobTitle: user.jobTitle || existingProfile?.jobTitle || '',
    company: user.company || existingProfile?.company || '',
    location: user.location || existingProfile?.location || '',
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
        // Map auth session to our profile structure
        const mappedProfile = mapSessionToProfile(
          session ? {
            user: session.user ? {
              id: session.user.id,
              name: session.user.name,
              email: session.user.email,
              image: session.user.image,
              role: session.user.role
            } : null
          } : null
        );
        setProfile(mappedProfile);
        setError(null);
      } catch (err) {
        setError('Failed to load profile data');
        console.error('Profile mapping error:', err);
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
          setProfile(prev => prev ? { ...prev, ...data } : null);
          router.refresh();
        },
        onError: (err) => {
          setError(err.error.message || 'Failed to update profile');
          toast.error(err.error.message || 'Failed to update profile');
        }
      });
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
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
        error
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
};
