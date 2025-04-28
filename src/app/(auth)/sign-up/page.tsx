import { Spinner } from '@/components/ui/spinner';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import SignUpForm from './sign-up-form';

export const metadata: Metadata = {
  title: 'Sign Up',
  description: 'Create an account',
};

export default function SignUpPage() {
  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign Up</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your email below to login to your account
        </p>
      </div>
      <Suspense fallback={<Spinner />}>
        <SignUpForm />
      </Suspense>
    </main>
  );
}
