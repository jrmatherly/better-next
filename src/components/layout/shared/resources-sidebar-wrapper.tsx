'use client';

import { SharedSidebar } from '@/components/layout/shared/sidebar';
import type { BetterAuthSession } from '@/types/auth';

interface ResourcesSidebarWrapperProps {
  /** User session data */
  session: BetterAuthSession | null;
}

/**
 * Wrapper for the shared sidebar that passes user session context
 */
export function ResourcesSidebarWrapper({
  session,
}: ResourcesSidebarWrapperProps) {
  return <SharedSidebar session={session} />;
}
