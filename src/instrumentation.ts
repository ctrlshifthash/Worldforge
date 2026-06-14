import * as Sentry from '@sentry/nextjs';

// Server + edge runtime Sentry init. No-ops if the DSN isn't set, and only
// actually reports in production so local/dev noise doesn't hit the dashboard.
export async function register() {
  const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) return;

  if (process.env.NEXT_RUNTIME === 'nodejs' || process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn,
      enabled: process.env.NODE_ENV === 'production',
      tracesSampleRate: 0.1,
      // Don't send PII; we only want stack traces + context.
      sendDefaultPii: false,
    });
  }
}

// Captures errors thrown in nested React Server Components / route handlers.
export const onRequestError = Sentry.captureRequestError;
