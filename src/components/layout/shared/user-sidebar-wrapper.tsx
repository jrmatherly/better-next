'use client';

import { SharedSidebar } from '@/components/layout/shared/sidebar';
import type { BetterAuthSession } from '@/types/auth';

interface UserSidebarWrapperProps {
  /** User session data */
  session: BetterAuthSession | null;
}

/**
 * Wrapper for the shared sidebar that passes user session context
 */
export function UserSidebarWrapper({ session }: UserSidebarWrapperProps) {
  return <SharedSidebar session={session} />;
}
