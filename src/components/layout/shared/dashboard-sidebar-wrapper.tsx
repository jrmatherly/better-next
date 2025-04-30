'use client';

import { SharedSidebar } from '@/components/layout/shared/sidebar';
import type { BetterAuthSession } from '@/types/auth';

interface DashboardSidebarWrapperProps {
  /** User session data */
  session: BetterAuthSession | null;
}

/**
 * Wrapper for the shared sidebar that passes user session context
 */
export function DashboardSidebarWrapper({
  session,
}: DashboardSidebarWrapperProps) {
  return <SharedSidebar session={session} />;
}
