// This file configures the initialization of Sentry on the client.
// The config you add here will be used whenever a users loads a page in their browser.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: 'https://415a6b73efb8b6e47d70afe7d883c601@wlhsentry.aarons.com/2',

  // Add optional integrations for additional features
  integrations: [Sentry.replayIntegration()],

  // Define how likely traces are sampled. Adjust this value in production, or use tracesSampler for greater control.
  tracesSampleRate: 1,

  // Define how likely Replay events are sampled.
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // Define how likely Replay events are sampled when an error occurs.
  // If you're not using Replay, this parameter is ignored.
  replaysOnErrorSampleRate: 1.0,
});

// Export the router transition hook to properly instrument navigations
// This is required for Sentry to capture router transitions in Next.js
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
