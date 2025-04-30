import { ProfileForm } from '@/components/auth/user/profile/profile-form';
import { ProfileHeader } from '@/components/auth/user/profile/profile-header';
import { ProfileProvider } from '@/providers/profile-provider';
import { Card, Divider } from '@heroui/react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import React from 'react';

export default function UserProfile() {
  return (
    <div className="min-h-screen bg-background transition-colors duration-300">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            Account Settings
          </h1>
        </div>

        <ProfileProvider>
          <Card className="p-0 overflow-hidden">
            <ProfileHeader />
            <Divider />
            <ProfileForm />
          </Card>
        </ProfileProvider>
      </div>
    </div>
  );
}
