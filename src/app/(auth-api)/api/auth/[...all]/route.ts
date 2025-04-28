import { auth } from '@/lib/auth/server';
import { toNextJsHandler } from 'better-auth/next-js';
import { NextRequest } from 'next/server';

export const { GET } = toNextJsHandler(auth);

export const POST = async (req: NextRequest) => {
  const res = await auth.handler(req);
  return res;
};

// ORIGINAL CONFIGURATION
/* import { auth } from '@/lib/auth/server';
import { toNextJsHandler } from 'better-auth/next-js';

export const { POST, GET } = toNextJsHandler(auth); */
