'use client';

import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { LoadingButton } from '@/components/ui/loading-button';
import { PasswordInput } from '@/components/ui/password-input';
import { changePassword } from '@/lib/auth/client';
import { authLogger } from '@/lib/logger';
import { updatePasswordSchema } from '@/schema/user';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

export function UserPasswordForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
      revokeOtherSessions: false,
    },
  });
  const { isDirty } = form.formState;

  function onSubmit(values: z.infer<typeof updatePasswordSchema>) {
    startTransition(async () => {
      await changePassword(
        {
          newPassword: values.password,
          currentPassword: values.currentPassword,
          revokeOtherSessions: values.revokeOtherSessions,
        },
        {
          onRequest: () => {
            toast.loading('Updating password...', {
              id: 'updatePasswordToast',
            });
          },
          onSuccess: () => {
            toast.success('Password updated successfully', {
              id: 'updatePasswordToast',
            });
            form.reset();
            router.refresh();
          },
          onError: ctx => {
            toast.error(ctx.error.message ?? 'Something went wrong.', {
              id: 'updatePasswordToast',
            });
            authLogger.error('error', ctx);
          },
        }
      );
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <PasswordInput type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <PasswordInput type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <PasswordInput type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="revokeOtherSessions"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Revoke all other sessions</FormLabel>
                <FormDescription>
                  This will sign you out from all other devices and sessions
                  except the current one.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <LoadingButton disabled={!isDirty} loading={isPending}>
          Update Password
        </LoadingButton>
      </form>
    </Form>
  );
}
