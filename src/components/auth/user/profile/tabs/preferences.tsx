'use client';

import { useProfileContext } from '@/hooks/use-profile';
import { Button, Card, CardBody, Switch } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const PreferencesTab = () => {
  const { profile, updateProfile } = useProfileContext();
  const [preferences, setPreferences] = useState({
    emailNotifications: profile.preferences?.emailNotifications ?? true,
    marketingEmails: profile.preferences?.marketingEmails ?? false,
    securityAlerts: profile.preferences?.securityAlerts ?? true,
    productUpdates: profile.preferences?.productUpdates ?? true,
    twoFactorAuth: profile.preferences?.twoFactorAuth ?? false,
    sessionTimeout: profile.preferences?.sessionTimeout ?? false,
    dataSharing: profile.preferences?.dataSharing ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    if (profile.preferences) {
      setPreferences({
        emailNotifications: profile.preferences.emailNotifications ?? true,
        marketingEmails: profile.preferences.marketingEmails ?? false,
        securityAlerts: profile.preferences.securityAlerts ?? true,
        productUpdates: profile.preferences.productUpdates ?? true,
        twoFactorAuth: profile.preferences.twoFactorAuth ?? false,
        sessionTimeout: profile.preferences.sessionTimeout ?? false,
        dataSharing: profile.preferences.dataSharing ?? true,
      });
    }
  }, [profile.preferences]);

  const handleToggle = (key: keyof typeof preferences, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      updateProfile({ preferences });
      setIsSaving(false);
      setIsDirty(false);
      toast.success('Your preferences have been saved successfully.');
    }, 1000);
  };

  const handleCancel = () => {
    if (profile.preferences) {
      setPreferences({
        emailNotifications: profile.preferences.emailNotifications ?? true,
        marketingEmails: profile.preferences.marketingEmails ?? false,
        securityAlerts: profile.preferences.securityAlerts ?? true,
        productUpdates: profile.preferences.productUpdates ?? true,
        twoFactorAuth: profile.preferences.twoFactorAuth ?? false,
        sessionTimeout: profile.preferences.sessionTimeout ?? false,
        dataSharing: profile.preferences.dataSharing ?? true,
      });
    }
    setIsDirty(false);
  };

  const PreferenceItem = ({
    title,
    description,
    icon,
    value,
    onChange,
  }: {
    title: string;
    description: string;
    icon: string;
    value: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <div className="flex justify-between items-center gap-4 py-4">
      <div className="flex gap-3">
        <div className="mt-0.5 text-default-500">
          <Icon icon={icon} width={20} height={20} />
        </div>
        <div>
          <h4 className="text-foreground font-medium">{title}</h4>
          <p className="text-small text-default-500">{description}</p>
        </div>
      </div>
      <Switch isSelected={value} onValueChange={onChange} color="primary" />
    </div>
  );

  return (
    <div className="animate-in py-4 space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-foreground">
          Notification Preferences
        </h3>

        <div className="space-y-4">
          <Card className="bg-content2/60 border border-content3">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">
                    Email Notifications
                  </p>
                  <p className="text-foreground/70 text-sm">
                    Receive notifications about account activity via email
                  </p>
                </div>
                <Switch
                  isSelected={preferences.emailNotifications}
                  onChange={() =>
                    handleToggle(
                      'emailNotifications',
                      !preferences.emailNotifications
                    )
                  }
                  color="primary"
                  size="lg"
                />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-content2/60 border border-content3">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">
                    Marketing Emails
                  </p>
                  <p className="text-foreground/70 text-sm">
                    Receive promotional emails and offers
                  </p>
                </div>
                <Switch
                  isSelected={preferences.marketingEmails}
                  onChange={() =>
                    handleToggle(
                      'marketingEmails',
                      !preferences.marketingEmails
                    )
                  }
                  color="primary"
                  size="lg"
                />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-content2/60 border border-content3">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Security Alerts</p>
                  <p className="text-foreground/70 text-sm">
                    Get notified about security-related events
                  </p>
                </div>
                <Switch
                  isSelected={preferences.securityAlerts}
                  onChange={() =>
                    handleToggle('securityAlerts', !preferences.securityAlerts)
                  }
                  color="primary"
                  size="lg"
                />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-content2/60 border border-content3">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Product Updates</p>
                  <p className="text-foreground/70 text-sm">
                    Stay informed about new features and improvements
                  </p>
                </div>
                <Switch
                  isSelected={preferences.productUpdates}
                  onChange={() =>
                    handleToggle('productUpdates', !preferences.productUpdates)
                  }
                  color="primary"
                  size="lg"
                />
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-medium text-foreground">
          Security Preferences
        </h3>

        <div className="space-y-4">
          <Card className="bg-content2/60 border border-content3">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">
                    Two-Factor Authentication
                  </p>
                  <p className="text-foreground/70 text-sm">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <Switch
                  isSelected={preferences.twoFactorAuth}
                  onChange={() =>
                    handleToggle('twoFactorAuth', !preferences.twoFactorAuth)
                  }
                  color="primary"
                  size="lg"
                />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-content2/60 border border-content3">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Session Timeout</p>
                  <p className="text-foreground/70 text-sm">
                    Automatically log out after period of inactivity
                  </p>
                </div>
                <Switch
                  isSelected={preferences.sessionTimeout}
                  onChange={() =>
                    handleToggle('sessionTimeout', !preferences.sessionTimeout)
                  }
                  color="primary"
                  size="lg"
                />
              </div>
            </CardBody>
          </Card>

          <Card className="bg-content2/60 border border-content3">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground font-medium">Data Sharing</p>
                  <p className="text-foreground/70 text-sm">
                    Allow anonymous usage data to improve our services
                  </p>
                </div>
                <Switch
                  isSelected={preferences.dataSharing}
                  onChange={() =>
                    handleToggle('dataSharing', !preferences.dataSharing)
                  }
                  color="primary"
                  size="lg"
                />
              </div>
            </CardBody>
          </Card>
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
          Save Preferences
        </Button>
      </div>
    </div>
  );
};
