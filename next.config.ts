import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default withSentryConfig(nextConfig, {
  org: "boolean-ri",
  project: "javascript-nextjs",
  // Quiet the plugin unless we're in CI.
  silent: !process.env.CI,
  // Source maps are only uploaded when an auth token is present; without it the
  // build still succeeds (errors just won't be symbolicated). Set
  // SENTRY_AUTH_TOKEN in the build env later to enable readable stack traces.
  authToken: process.env.SENTRY_AUTH_TOKEN,
  widenClientFileUpload: true,
  disableLogger: true,
});
