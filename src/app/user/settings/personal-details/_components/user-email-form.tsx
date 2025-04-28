'use client';

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
/* import { LoadingButton } from '@/components/ui/loading-button'; */
import { changeEmail } from '@/lib/auth/client';
import { authLogger } from '@/lib/logger';
import { updateEmailSchema } from '@/schema/user';
import type { Session } from '@/types/auth.d';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';

interface UserEmailFormProps {
  session: Session | null;
}

export function UserEmailForm({ session }: UserEmailFormProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<z.infer<typeof updateEmailSchema>>({
    resolver: zodResolver(updateEmailSchema),
    defaultValues: {
      email: session?.user?.email ?? '',
    },
  });
  const { isDirty } = form.formState;

  function onSubmit(values: z.infer<typeof updateEmailSchema>) {
    startTransition(async () => {
      await changeEmail(
        {
          newEmail: values.email,
        },
        {
          onRequest: () => {
            toast.loading('Updating email...', { id: 'updateEmailToast' });
          },
          onSuccess: () => {
            toast.success('Email updated successfully', {
              id: 'updateEmailToast',
            });
            form.reset({ email: values.email });
            router.refresh();
          },
          onError: ctx => {
            toast.error(ctx.error.message ?? 'Something went wrong.', {
              id: 'updateEmailToast',
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
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  placeholder="example@email.com"
                  type="email"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                We will never share your email with anyone else.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <LoadingButton disabled={!isDirty} loading={isPending}>
          Update email
        </LoadingButton> */}
      </form>
    </Form>
  );
}
