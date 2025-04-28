'use client';

import { Button, type ButtonProps } from '@/components/ui/button';
import { useImpersonation } from '@/hooks/use-impersonation';
import { cn } from '@/lib/utils';

interface ImpersonateButtonProps extends Omit<ButtonProps, 'onClick'> {
  /** ID of the user to impersonate */
  userId: string;
}

/**
 * Button component for administrators to impersonate a user
 * Uses the impersonation hook to start an impersonation session
 */
export function ImpersonateButton({
  userId,
  className,
  variant = 'secondary',
  size = 'sm',
  ...props
}: ImpersonateButtonProps) {
  const { impersonateUser, isLoading } = useImpersonation();

  const handleImpersonate = async () => {
    await impersonateUser(userId);
  };

  return (
    <Button
      onClick={handleImpersonate}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={cn('gap-1', className)}
      {...props}
    >
      {isLoading ? 'Starting...' : 'Impersonate User'}
    </Button>
  );
}
