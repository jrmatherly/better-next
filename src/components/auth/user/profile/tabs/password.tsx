'use client';

import { usePasswordUpdate } from '@/hooks/use-profile';
import { Button, Input } from '@heroui/react';
import { Icon } from '@iconify/react';
import { useState } from 'react';
import { z } from 'zod';

/**
 * Password validation schema using Zod
 */
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(1, 'New password is required')
      .min(8, 'Password must be at least 8 characters')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^a-zA-Z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormData = z.infer<typeof passwordSchema>;

export const PasswordTab = () => {
  const { updatePassword, isLoading: isSaving } = usePasswordUpdate();
  const [formData, setFormData] = useState<PasswordFormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isVisible, setIsVisible] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });

  const handleChange = (field: keyof PasswordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Calculate password strength when new password changes
    if (field === 'newPassword') {
      // Simple password strength calculation
      let strength = 0;
      if (value.length >= 8) strength += 1;
      if (/[a-z]/.test(value)) strength += 1;
      if (/[A-Z]/.test(value)) strength += 1;
      if (/[0-9]/.test(value)) strength += 1;
      if (/[^a-zA-Z0-9]/.test(value)) strength += 1;

      // Scale to 0-4 range
      strength = Math.min(4, Math.floor((strength / 5) * 4));
      setPasswordStrength(strength);
    }

    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const toggleVisibility = (field: keyof typeof isVisible) => {
    setIsVisible(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const getPasswordStrengthColor = () => {
    switch (passwordStrength) {
      case 0:
        return 'bg-danger-500';
      case 1:
        return 'bg-danger-400';
      case 2:
        return 'bg-warning-500';
      case 3:
        return 'bg-success-400';
      case 4:
        return 'bg-success-500';
      default:
        return 'bg-default-200';
    }
  };

  const getPasswordStrengthText = () => {
    switch (passwordStrength) {
      case 0:
        return 'Very Weak';
      case 1:
        return 'Weak';
      case 2:
        return 'Fair';
      case 3:
        return 'Good';
      case 4:
        return 'Strong';
      default:
        return '';
    }
  };

  const validateForm = () => {
    try {
      passwordSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Convert Zod errors to our error format
        const newErrors: Record<string, string> = {};
        for (const err of error.errors) {
          const path = err.path[0];
          if (path !== undefined && typeof path === 'string') {
            newErrors[path] = err.message;
          }
        }
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // Use BetterAuth's changePassword function from our custom hook
    const success = await updatePassword(
      formData.currentPassword,
      formData.newPassword,
      true // Revoke other sessions for security
    );

    if (success) {
      // Clear form data on success
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordStrength(0);
    }
  };

  return (
    <div className="animate-in py-4 space-y-8">
      <div className="space-y-6 max-w-md">
        <h3 className="text-lg font-medium text-foreground">Change Password</h3>

        <Input
          label="Current Password"
          placeholder="Enter your current password"
          value={formData.currentPassword}
          onValueChange={value => handleChange('currentPassword', value)}
          type={isVisible.currentPassword ? 'text' : 'password'}
          isRequired
          isInvalid={!!errors.currentPassword}
          errorMessage={errors.currentPassword}
          variant="bordered"
          classNames={{
            label: 'text-foreground/90 font-medium text-sm mb-1',
            input: 'text-foreground font-medium',
            inputWrapper:
              'bg-content2 border-content3 shadow-sm hover:bg-content2/80 focus:bg-content2/80',
            base: 'w-full',
          }}
          startContent={<Icon icon="lucide:lock" className="text-primary/80" />}
          endContent={
            <button
              type="button"
              onClick={() => toggleVisibility('currentPassword')}
              className="focus:outline-none text-foreground/80 hover:text-foreground"
            >
              <Icon
                icon={
                  isVisible.currentPassword ? 'lucide:eye-off' : 'lucide:eye'
                }
                width={16}
              />
            </button>
          }
        />

        <div className="space-y-2">
          <Input
            label="New Password"
            placeholder="Enter your new password"
            value={formData.newPassword}
            onValueChange={value => handleChange('newPassword', value)}
            type={isVisible.newPassword ? 'text' : 'password'}
            isRequired
            isInvalid={!!errors.newPassword}
            errorMessage={errors.newPassword}
            variant="bordered"
            classNames={{
              label: 'text-foreground/90 font-medium text-sm mb-1',
              input: 'text-foreground font-medium',
              inputWrapper:
                'bg-content2 border-content3 shadow-sm hover:bg-content2/80 focus:bg-content2/80',
              base: 'w-full',
            }}
            startContent={
              <Icon icon="lucide:lock" className="text-primary/80" />
            }
            endContent={
              <button
                type="button"
                onClick={() => toggleVisibility('newPassword')}
                className="focus:outline-none text-foreground/80 hover:text-foreground"
              >
                <Icon
                  icon={isVisible.newPassword ? 'lucide:eye-off' : 'lucide:eye'}
                  width={16}
                />
              </button>
            }
          />

          {formData.newPassword && (
            <div className="space-y-1">
              <div className="w-full h-1 bg-default-100 rounded-full overflow-hidden">
                <div
                  className={`password-strength-indicator ${getPasswordStrengthColor()}`}
                  style={{ width: `${(passwordStrength + 1) * 20}%` }}
                />
              </div>
              <p className="text-small text-default-500">
                Password strength:{' '}
                <span
                  className={`font-medium ${passwordStrength >= 3 ? 'text-success-500' : passwordStrength >= 2 ? 'text-warning-500' : 'text-danger-500'}`}
                >
                  {getPasswordStrengthText()}
                </span>
              </p>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          placeholder="Confirm your new password"
          value={formData.confirmPassword}
          onValueChange={value => handleChange('confirmPassword', value)}
          type={isVisible.confirmPassword ? 'text' : 'password'}
          isRequired
          isInvalid={!!errors.confirmPassword}
          errorMessage={errors.confirmPassword}
          variant="bordered"
          classNames={{
            label: 'text-foreground/90 font-medium text-sm mb-1',
            input: 'text-foreground font-medium',
            inputWrapper:
              'bg-content2 border-content3 shadow-sm hover:bg-content2/80 focus:bg-content2/80',
            base: 'w-full',
          }}
          startContent={<Icon icon="lucide:lock" className="text-primary/80" />}
          endContent={
            <button
              type="button"
              onClick={() => toggleVisibility('confirmPassword')}
              className="focus:outline-none text-foreground/80 hover:text-foreground"
            >
              <Icon
                icon={
                  isVisible.confirmPassword ? 'lucide:eye-off' : 'lucide:eye'
                }
                width={16}
              />
            </button>
          }
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          variant="flat"
          onPress={() => {
            setFormData({
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
            setErrors({});
            setPasswordStrength(0);
          }}
          isDisabled={isSaving}
          className="bg-content2 text-foreground border border-content3"
        >
          Clear
        </Button>
        <Button
          color="primary"
          onPress={handleSave}
          isLoading={isSaving}
          isDisabled={
            !formData.currentPassword ||
            !formData.newPassword ||
            !formData.confirmPassword
          }
          className="font-medium"
        >
          Update Password
        </Button>
      </div>
    </div>
  );
};
