'use client';

import { signInSchema } from '@/schema/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { signIn } from '@/lib/auth/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';

import { authLogger } from '@/lib/logger';
import { AUTHENTICATED_URL } from '@/lib/settings';
import type { ErrorContext } from '@better-fetch/fetch';
import { Button, Checkbox, Divider, Input, Link } from '@heroui/react';
import { Icon } from '@iconify/react';
import React from 'react';
import { toast } from 'sonner';

export default function LoginForm() {
  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const encodedCallbackUrl = encodeURIComponent(callbackUrl ?? '');

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const openSignUpPage = () => {
    if (!callbackUrl) {
      router.push('/sign-up');
    } else {
      router.push(`/sign-up?callbackUrl=${encodedCallbackUrl}`);
    }
  };

  const handleCredentialsSignIn = async (
    values: z.infer<typeof signInSchema>
  ) => {
    startTransition(async () => {
      await signIn.email(
        {
          email: values.email,
          password: values.password,
        },
        {
          onRequest: () => {
            toast.loading('Signing in...', { id: 'signInToast' });
          },
          onSuccess: async () => {
            toast.success('Signed in successfully', { id: 'signInToast' });
            router.push(callbackUrl ?? AUTHENTICATED_URL);
            router.refresh();
          },
          onError: (ctx: ErrorContext) => {
            toast.error(ctx.error.message ?? 'Something went wrong.', {
              id: 'signInToast',
            });
            authLogger.error('error', ctx);
          },
        }
      );
    });
  };

  const handleMicrosoftSignIn = () => {
    startTransition(async () => {
      try {
        await signIn.social({
          provider: 'microsoft',
          callbackURL: callbackUrl ?? AUTHENTICATED_URL,
        });
        toast.loading('Redirecting to Microsoft login...', {
          id: 'microsoftSignInToast',
        });
      } catch (error) {
        toast.error('Failed to initiate Microsoft sign-in', {
          id: 'microsoftSignInToast',
        });
        authLogger.error('Microsoft sign-in error', { error });
      }
    });
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-large bg-content1 px-8 pb-10 pt-6 shadow-small">
      <p className="pb-2 text-xl font-medium">Log In</p>
      <form
        className="flex flex-col gap-3"
        onSubmit={form.handleSubmit(handleCredentialsSignIn)}
      >
        <Input
          label="Email Address"
          name="email"
          placeholder="Enter your email"
          type="email"
          variant="bordered"
          value={form.watch('email')}
          onChange={e => form.setValue('email', e.target.value)}
          isInvalid={!!form.formState.errors.email}
          errorMessage={form.formState.errors.email?.message}
        />
        <Input
          endContent={
            <button type="button" onClick={toggleVisibility}>
              {isVisible ? (
                <Icon
                  className="pointer-events-none text-2xl text-default-400"
                  icon="solar:eye-closed-linear"
                />
              ) : (
                <Icon
                  className="pointer-events-none text-2xl text-default-400"
                  icon="solar:eye-bold"
                />
              )}
            </button>
          }
          label="Password"
          name="password"
          placeholder="Enter your password"
          type={isVisible ? 'text' : 'password'}
          variant="bordered"
          value={form.watch('password')}
          onChange={e => form.setValue('password', e.target.value)}
          isInvalid={!!form.formState.errors.password}
          errorMessage={form.formState.errors.password?.message}
        />
        <div className="flex items-center justify-between px-1 py-2">
          <Checkbox name="remember" size="sm">
            Remember me
          </Checkbox>
          <Link className="text-default-500" href="/forgot-password" size="sm">
            Forgot password?
          </Link>
        </div>
        <Button color="primary" type="submit" isLoading={isPending}>
          Log In
        </Button>
      </form>
      <div className="flex items-center gap-4 py-2">
        <Divider className="flex-1" />
        <p className="shrink-0 text-tiny text-default-500">OR</p>
        <Divider className="flex-1" />
      </div>
      <div className="flex flex-col gap-2">
        <Button
          startContent={<Icon icon="logos:microsoft" width={24} />}
          variant="bordered"
          onPress={handleMicrosoftSignIn}
          isLoading={isPending}
        >
          Continue with Microsoft
        </Button>
      </div>
      <p className="text-center text-small">
        Need to create an account?&nbsp;
        <Link href="#" size="sm" onClick={openSignUpPage}>
          Sign Up
        </Link>
      </p>
    </div>
  );
}
