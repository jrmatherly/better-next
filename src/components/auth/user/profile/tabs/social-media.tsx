'use client';

import { useProfileContext } from '@/hooks/use-profile';
import { Button, Divider, Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'sonner';

const socialPlatforms = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: 'logos:twitter',
    placeholder: 'username',
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: 'logos:linkedin-icon',
    placeholder: 'profile-url',
  },
  {
    id: 'github',
    name: 'GitHub',
    icon: 'logos:github-icon',
    placeholder: 'username',
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: 'skill-icons:instagram',
    placeholder: 'username',
  },
  {
    id: 'facebook',
    name: 'Facebook',
    icon: 'logos:facebook',
    placeholder: 'profile-url',
  },
];

export const SocialMediaTab = () => {
  const { profile, updateProfile } = useProfileContext();
  const [socialLinks, setSocialLinks] = useState<Record<string, string>>(
    profile.socialLinks || {}
  );
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (profile.socialLinks) {
      setSocialLinks(profile.socialLinks);
    }
  }, [profile.socialLinks]);

  const handleChange = (platform: string, value: string) => {
    setSocialLinks(prev => ({ ...prev, [platform]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      updateProfile({ socialLinks });
      setIsSaving(false);
      setIsDirty(false);
      toast.success('Your social media links have been saved successfully.');
    }, 1000);
  };

  const handleCancel = () => {
    if (profile.socialLinks) {
      setSocialLinks(profile.socialLinks);
    } else {
      setSocialLinks({});
    }
    setIsDirty(false);
  };

  return (
    <div className="animate-in py-4 space-y-8">
      <div className="space-y-6">
        <h3 className="text-xl font-semibold text-foreground">
          Social Media Links
        </h3>
        <p className="text-foreground/80">
          Connect your social media accounts to your profile.
        </p>

        <div className="space-y-6 max-w-md">
          {socialPlatforms.map((platform, index) => (
            <Fragment key={platform.id}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center rounded-full bg-content2/80 shadow-sm">
                  <Icon icon={platform.icon} width={24} height={24} />
                </div>
                <Input
                  label={platform.name}
                  placeholder={`Enter your ${platform.name} ${platform.placeholder}`}
                  value={socialLinks[platform.id] || ''}
                  onValueChange={value => handleChange(platform.id, value)}
                  variant="bordered"
                  classNames={{
                    label: 'text-foreground/90 font-medium text-sm mb-1',
                    input: 'text-foreground font-medium',
                    inputWrapper:
                      'bg-content2 border-content3 shadow-sm hover:bg-content2/80 focus:bg-content2/80',
                    base: 'w-full',
                  }}
                  startContent={
                    platform.id === 'twitter' ? (
                      <span className="text-foreground/80 font-medium">@</span>
                    ) : platform.id === 'instagram' ? (
                      <span className="text-foreground/80 font-medium">@</span>
                    ) : null
                  }
                />
              </div>
              {index < socialPlatforms.length - 1 && (
                <Divider className="border-content3 my-1" />
              )}
            </Fragment>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="flat"
          onPress={handleCancel}
          isDisabled={!isDirty || isSaving}
          className="bg-content2 text-foreground border border-content3"
        >
          Cancel
        </Button>
        <Button
          color="primary"
          onPress={handleSave}
          isLoading={isSaving}
          isDisabled={!isDirty}
          className="font-medium"
        >
          Save Links
        </Button>
      </div>
    </div>
  );
};
