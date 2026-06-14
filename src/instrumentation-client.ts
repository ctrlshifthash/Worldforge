import * as Sentry from '@sentry/nextjs';

// Browser Sentry init. No-ops without a DSN, reports only in production.
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
if (dsn) {
  Sentry.init({
    dsn,
    enabled: process.env.NODE_ENV === 'production',
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
  });
}

// Instruments client-side navigations so route transitions show up in traces.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
