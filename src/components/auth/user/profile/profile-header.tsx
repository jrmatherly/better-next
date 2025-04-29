'use client';

import { useProfileContext } from '@/hooks/use-profile';
import { Avatar, Button } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

export const ProfileHeader = () => {
  const { profile, updateProfile } = useProfileContext();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(jpeg|jpg|png|webp)/)) {
      toast.error('Please upload a JPG, PNG, or WebP image.');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Please upload an image smaller than 5MB.');
      return;
    }

    setIsUploading(true);

    // Simulate upload delay
    setTimeout(() => {
      const reader = new FileReader();
      reader.onload = event => {
        updateProfile({ avatarUrl: event.target?.result as string });
        setIsUploading(false);
        toast.success('Profile photo updated');
      };
      reader.readAsDataURL(file);
    }, 1000);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="p-8 bg-content1/50 shadow-sm rounded-t-lg border-b border-content3 flex flex-col md:flex-row gap-6 items-center md:items-start">
      <div className="relative group">
        <Avatar
          src={profile?.avatarUrl || undefined}
          name={`${profile?.firstName || ''} ${profile?.lastName || ''}`}
          className="w-24 h-24 text-large shadow-md"
          isBordered
          color="primary"
        />
        <Button
          isIconOnly
          size="sm"
          color="primary"
          variant="solid"
          className="absolute bottom-0 right-0 rounded-full shadow-md"
          onPress={handleUploadClick}
          isLoading={isUploading}
        >
          {!isUploading && <Icon icon="lucide:camera" width={16} />}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex flex-col items-center md:items-start">
        <h2 className="text-xl font-semibold text-foreground">
          {profile?.firstName || ''} {profile?.lastName || ''}
        </h2>
        <p className="text-foreground/70 mt-1">{profile?.email || ''}</p>
        <p className="text-foreground/65 text-sm mt-1">
          User Role: {profile?.role || ''}
        </p>
        <p className="text-foreground/60 text-sm mt-1">
          Member since {profile?.memberSince || ''}
        </p>
      </div>
    </div>
  );
};
