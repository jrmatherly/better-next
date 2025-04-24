'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { AccessDeniedAlertProps } from '@/types/auth';
import { ShieldAlert } from 'lucide-react';
import type { FC } from 'react';

/**
 * Display an alert for access denied/unauthorized situations
 * Used across protected routes and role-guarded components
 */
export const AccessDeniedAlert: FC<AccessDeniedAlertProps> = ({
  title = 'Access Denied',
  description = 'You do not have permission to access this resource.',
  children,
  className,
}) => {
  return (
    <Alert variant="destructive" className={cn('border-red-500/50', className)}>
      <ShieldAlert className="h-5 w-5" />
      <AlertTitle className="font-semibold">{title}</AlertTitle>
      <AlertDescription className="mt-2">
        {description}
        {children && <div className="mt-4">{children}</div>}
      </AlertDescription>
    </Alert>
  );
};
