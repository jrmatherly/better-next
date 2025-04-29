import { z } from 'zod';

/**
 * User preferences settings schema
 * Defines user configurable settings and notification preferences
 */
export const preferencesSchema = z.object({
  /** Whether the user wants to receive general email notifications */
  emailNotifications: z.boolean().default(true),
  /** Whether the user wants to receive marketing emails */
  marketingEmails: z.boolean().default(false),
  /** Whether the user wants to receive security-related alerts */
  securityAlerts: z.boolean().default(true),
  /** Whether the user wants to receive product updates and news */
  productUpdates: z.boolean().default(true),
  /** Whether two-factor authentication is enabled for the user */
  twoFactorAuth: z.boolean().default(false),
  /** Whether automatic session timeout is enabled */
  sessionTimeout: z.boolean().default(false),
  /** Whether the user allows anonymous data sharing for product improvement */
  dataSharing: z.boolean().default(true),
});

/**
 * User preferences settings interface
 * Represents user configurable settings for notifications and security
 */
export interface Preferences extends z.infer<typeof preferencesSchema> {}

/**
 * Complete user profile schema
 * Defines the structure and validation rules for user profile data
 */
export const profileSchema = z.object({
  /** User's first name */
  firstName: z.string().min(1, "First name is required"),
  /** User's last name */
  lastName: z.string().min(1, "Last name is required"),
  /** User's email address */
  email: z.string().email("Please enter a valid email address"),
  /** User's phone number (optional) */
  phone: z.string().optional(),
  /** User's job title (optional) */
  jobTitle: z.string().optional(),
  /** User's company or organization (optional) */
  company: z.string().optional(),
  /** User's location or address (optional) */
  location: z.string().optional(),
  /** URL to user's profile image (optional) */
  avatarUrl: z.string().optional(),
  /** When the user joined the platform */
  memberSince: z.string(),
  /** User's preferences and settings */
  preferences: z.custom<Preferences>((val) => true).default({}),
  /** User's connected social accounts */
  socialLinks: z.record(z.string()).optional(),
  /** User's role in the system */
  role: z.string().optional(),
});

/**
 * User profile data interface
 * Represents a user's complete profile information
 */
export interface Profile extends z.infer<typeof profileSchema> {}

/**
 * Context type for the profile provider
 * Defines the shape of the React context for profile data management
 */
export interface ProfileContextType {
  /** The user's profile data */
  profile: Profile;
  /** Function to update profile data */
  updateProfile: (data: Partial<Profile>) => Promise<boolean>;
  /** Whether a profile operation is in progress */
  isLoading: boolean;
  /** Error message if a profile operation failed */
  error: string | null;
}

/**
 * BetterAuth native field mapping
 * Maps between our profile fields and what's directly supported by BetterAuth API
 */
export interface BetterAuthUserFields {
  /** User's full name (maps to firstName + lastName) */
  name?: string;
  /** User's email address */
  email: string;
  /** URL to user's profile image (maps to avatarUrl) */
  image?: string;
}
