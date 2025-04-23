import { authActions } from '@/lib/auth/actions';
import { authConfig } from '@/lib/auth/config';
import { betterAuth } from 'better-auth';

export const auth = betterAuth({ ...authConfig, ...authActions });
