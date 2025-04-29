'use client';

import { useProfileContext } from '@/hooks/use-profile';
import { Button, Divider, Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';

export const PersonalInfoTab = () => {
  const { profile, updateProfile } = useProfileContext();
  const [formData, setFormData] = useState({
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    phone: profile.phone || '',
    jobTitle: profile.jobTitle || '',
    company: profile.company || '',
    location: profile.location || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone || '',
      jobTitle: profile.jobTitle || '',
      company: profile.company || '',
      location: profile.location || '',
    });
  }, [profile]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);

    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (
      formData.phone &&
      !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(
        formData.phone
      )
    ) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;

    setIsSaving(true);

    // Simulate API call
    setTimeout(() => {
      updateProfile(formData);
      setIsSaving(false);
      setIsDirty(false);
    }, 1000);
  };

  const handleCancel = () => {
    setFormData({
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone || '',
      jobTitle: profile.jobTitle || '',
      company: profile.company || '',
      location: profile.location || '',
    });
    setErrors({});
    setIsDirty(false);
  };

  return (
    <div className="animate-in py-4 space-y-8">
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-foreground">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="First Name"
            placeholder="Enter your first name"
            value={formData.firstName}
            onValueChange={value => handleChange('firstName', value)}
            isRequired
            isInvalid={!!errors.firstName}
            errorMessage={errors.firstName}
            variant="bordered"
            classNames={{
              label: 'text-foreground/90 font-medium text-sm mb-1',
              input: 'text-foreground font-medium',
              inputWrapper:
                'bg-content2 border-content3 shadow-sm hover:bg-content2/80 focus:bg-content2/80',
              base: 'w-full',
            }}
            startContent={
              <Icon icon="lucide:user" className="text-primary/80" />
            }
          />

          <Input
            label="Last Name"
            placeholder="Enter your last name"
            value={formData.lastName}
            onValueChange={value => handleChange('lastName', value)}
            isRequired
            isInvalid={!!errors.lastName}
            errorMessage={errors.lastName}
            variant="bordered"
            classNames={{
              label: 'text-foreground/90 font-medium text-sm mb-1',
              input: 'text-foreground font-medium',
              inputWrapper:
                'bg-content2 border-content3 shadow-sm hover:bg-content2/80 focus:bg-content2/80',
              base: 'w-full',
            }}
            startContent={
              <Icon icon="lucide:user" className="text-primary/80" />
            }
          />
        </div>

        <Input
          label="Email"
          placeholder="Enter your email"
          value={formData.email}
          onValueChange={() => {}} // Email cannot be updated
          isDisabled
          variant="bordered"
          classNames={{
            label: 'text-foreground/90 font-medium text-sm mb-1',
            input: 'text-foreground font-medium',
            inputWrapper:
              'bg-content2 border-content3 shadow-sm hover:bg-content2/80 focus:bg-content2/80',
            base: 'w-full',
          }}
          startContent={<Icon icon="lucide:mail" className="text-primary/80" />}
        />

        <Input
          label="Phone"
          placeholder="Enter your phone number"
          value={formData.phone}
          onValueChange={value => handleChange('phone', value)}
          variant="bordered"
          classNames={{
            label: 'text-foreground/90 font-medium text-sm mb-1',
            input: 'text-foreground font-medium',
            inputWrapper:
              'bg-content2 border-content3 shadow-sm hover:bg-content2/80 focus:bg-content2/80',
            base: 'w-full',
          }}
          startContent={
            <Icon icon="lucide:phone" className="text-primary/80" />
          }
        />
      </div>

      <Divider />

      <div className="space-y-6">
        <h3 className="text-lg font-medium text-foreground">
          Professional Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Job Title"
            placeholder="Enter your job title"
            value={formData.jobTitle}
            onValueChange={value => handleChange('jobTitle', value)}
            variant="bordered"
            classNames={{
              label: 'text-foreground/90 font-medium text-sm mb-1',
              input: 'text-foreground font-medium',
              inputWrapper:
                'bg-content2 border-content3 shadow-sm hover:bg-content2/80 focus:bg-content2/80',
              base: 'w-full',
            }}
            startContent={
              <Icon icon="lucide:briefcase" className="text-primary/80" />
            }
          />

          <Input
            label="Company"
            placeholder="Enter your company name"
            value={formData.company}
            onValueChange={value => handleChange('company', value)}
            variant="bordered"
            classNames={{
              label: 'text-foreground/90 font-medium text-sm mb-1',
              input: 'text-foreground font-medium',
              inputWrapper:
                'bg-content2 border-content3 shadow-sm hover:bg-content2/80 focus:bg-content2/80',
              base: 'w-full',
            }}
            startContent={
              <Icon icon="lucide:building" className="text-primary/80" />
            }
          />
        </div>

        <Input
          label="Location"
          placeholder="Enter your location"
          value={formData.location}
          onValueChange={value => handleChange('location', value)}
          variant="bordered"
          classNames={{
            label: 'text-foreground/90 font-medium text-sm mb-1',
            input: 'text-foreground font-medium',
            inputWrapper:
              'bg-content2 border-content3 shadow-sm hover:bg-content2/80 focus:bg-content2/80',
            base: 'w-full',
          }}
          startContent={
            <Icon icon="lucide:map-pin" className="text-primary/80" />
          }
        />
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
          Save Information
        </Button>
      </div>
    </div>
  );
};
