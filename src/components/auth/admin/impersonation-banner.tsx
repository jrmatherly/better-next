'use client';

import { Button } from '@/components/ui/button';
import { useImpersonation } from '@/hooks/use-impersonation';
import { AlertTriangle } from 'lucide-react';

/**
 * Banner component that displays when a user is being impersonated
 * Provides a clear visual indicator and a button to end impersonation
 */
export function ImpersonationBanner({
  isImpersonating,
}: { isImpersonating: boolean }) {
  const { stopImpersonating, isLoading } = useImpersonation();

  if (!isImpersonating) {
    return null;
  }

  return (
    <div className="bg-amber-100 px-4 py-2 text-amber-800 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-5 w-5" />
        <span>
          <strong>Impersonation Active:</strong> You are viewing the application
          as another user
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={stopImpersonating}
        disabled={isLoading}
        className="bg-white hover:bg-amber-50 border-amber-300"
      >
        {isLoading ? 'Returning...' : 'Return to Admin Account'}
      </Button>
    </div>
  );
}
