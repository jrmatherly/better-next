import { Spinner } from '@/components/ui/spinner';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import LoginForm from './login-form';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Login into your account',
};

export default function LoginPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <LoginForm />
    </Suspense>
  );
}
