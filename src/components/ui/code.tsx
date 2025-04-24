'use client';

import { cn } from '@/lib/utils';
import React, { type ComponentPropsWithoutRef, type FC } from 'react';

interface CodeProps extends ComponentPropsWithoutRef<'pre'> {
  children: React.ReactNode;
}

export const Code: FC<CodeProps> = ({ className, children, ...props }) => {
  return (
    <pre
      className={cn(
        'rounded-md bg-muted p-4 overflow-auto font-mono text-sm',
        className
      )}
      {...props}
    >
      <code>{children}</code>
    </pre>
  );
};
