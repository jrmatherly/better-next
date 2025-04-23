'use client';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';

import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { signUp } from '@/lib/auth/client';
import { authLogger } from '@/lib/logger';
import { AUTHENTICATED_URL } from '@/lib/settings';
import { signUpSchema } from '@/schema/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

export default function SignUpForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const encodedCallbackUrl = encodeURIComponent(callbackUrl ?? '');

  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const openLoginPage = () => {
    if (!callbackUrl) {
      router.push('/login');
    } else {
      router.push(`/login?callbackUrl=${encodedCallbackUrl}`);
    }
  };

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = (values: z.infer<typeof signUpSchema>) => {
    startTransition(async () => {
      await signUp.email(
        {
          email: values.email,
          password: values.password,
          name: values.name,
        },
        {
          onRequest: () => {
            toast.loading('Creating account...', { id: 'signUpToast' });
          },
          onSuccess: () => {
            toast.success('Email verification sent.', {
              id: 'signUpToast',
              description: 'Please check your email to verify your account.',
              duration: Number.POSITIVE_INFINITY,
            });
            router.push(callbackUrl ?? AUTHENTICATED_URL);
          },
          onError: ctx => {
            toast.error(ctx.error.message ?? 'Something went wrong.', {
              id: 'signUpToast',
            });
            authLogger.error('error', ctx);
          },
        }
      );
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field: fieldProps }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="John doe"
                    autoComplete="name"
                    {...fieldProps}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field: fieldProps }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    placeholder="your@email.com"
                    autoComplete="email"
                    {...fieldProps}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field: fieldProps }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    type="password"
                    autoComplete="password"
                    {...fieldProps}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field: fieldProps }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <PasswordInput
                    type="password"
                    autoComplete="off"
                    {...fieldProps}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <LoadingButton loading={isPending} className="w-full">
            Sign up
          </LoadingButton>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm">
        <Button
          variant="link"
          onClick={openLoginPage}
          className="text-primary hover:underline"
        >
          Already have an account? Sign In
        </Button>
      </div>
    </>
  );
}
