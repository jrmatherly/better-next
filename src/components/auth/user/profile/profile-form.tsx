'use client';

// biome-ignore lint/correctness/noUnusedImports: used for context provider wrapping
import { ProfileProvider } from '@/providers/profile-provider';
import { Tab, Tabs } from '@heroui/react';
// biome-ignore lint/correctness/noUnusedImports: not used directly
import { Fragment } from 'react';
import { PasswordTab } from './tabs/password';
import { PersonalInfoTab } from './tabs/personal-info';
import { PreferencesTab } from './tabs/preferences';
import { SocialMediaTab } from './tabs/social-media';

export const ProfileForm = () => {
  return (
    <div className="p-6">
      <Tabs
        aria-label="Profile settings tabs"
        color="primary"
        variant="underlined"
        classNames={{
          tabList: 'gap-6 border-b border-content3 mb-6',
          cursor: 'w-full bg-primary',
          tab: 'max-w-fit px-4 h-12 text-medium font-medium data-[selected=true]:text-foreground data-[selected=false]:text-foreground/60',
          panel: 'py-4',
        }}
      >
        <Tab
          key="personal"
          title={
            <div className="flex items-center gap-2">
              <span>Personal Info</span>
            </div>
          }
        >
          <PersonalInfoTab />
        </Tab>
        <Tab
          key="password"
          title={
            <div className="flex items-center gap-2">
              <span>Password</span>
            </div>
          }
        >
          <PasswordTab />
        </Tab>
        <Tab
          key="preferences"
          title={
            <div className="flex items-center gap-2">
              <span>Preferences</span>
            </div>
          }
        >
          <PreferencesTab />
        </Tab>
        <Tab
          key="social"
          title={
            <div className="flex items-center gap-2">
              <span>Social Media</span>
            </div>
          }
        >
          <SocialMediaTab />
        </Tab>
      </Tabs>
    </div>
  );
};
