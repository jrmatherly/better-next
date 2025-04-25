import { auth } from '@/lib/auth/server';
import { authLogger } from '@/lib/logger';
import type { ExtendedSession } from '@/types/auth';
import { headers } from 'next/headers';
/**
 * Get the server session with proper typing
 */
export async function useServerSession(): Promise<ExtendedSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // If no session, return null
    if (!session) return null;

    // Cast to ExtendedSession type
    return session as ExtendedSession;
  } catch (error) {
    authLogger.error('Error getting server session:', error);
    return null;
  }
}
