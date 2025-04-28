'use client';

import { SharedSidebar } from '@/components/layout/shared/sidebar';
import type { BetterAuthSession } from '@/types/auth';

interface AdminSidebarWrapperProps {
  /** User session data */
  session: BetterAuthSession | null;
}

/**
 * Wrapper for the shared sidebar that passes admin session context
 */
export function AdminSidebarWrapper({ session }: AdminSidebarWrapperProps) {
  return <SharedSidebar session={session} />;
}
