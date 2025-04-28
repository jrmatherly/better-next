import { AcmeIcon } from '@/components/acme-logo';
import { APP_NAME } from '@/lib/settings';
import React from 'react';

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex min-h-svh w-full items-center justify-center">
      {/* Full-screen background image */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/black-background-texture-2.jpg"
          alt="Background"
          className="h-full w-full object-cover"
        />
        {/* Optional overlay for better text contrast */}
        <div className="absolute inset-0 bg-black/30" />
      </div>
      
      {/* Brand logo in top right */}
      <div className="absolute right-10 top-10 z-10">
        <div className="flex items-center">
          <AcmeIcon className="text-white" size={40} />
          <p className="font-medium text-white">{APP_NAME}</p>
        </div>
      </div>
      
      {/* Centered content */}
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
