import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  // Prettier CRLF/import-order noise should not block CI image builds.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Keep the production image lean by omitting heavy unused tooling from the trace.
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@swc/core-linux-x64-gnu',
      'node_modules/@swc/core-linux-x64-musl',
      'node_modules/@esbuild',
      'node_modules/webpack',
      'node_modules/typescript',
    ],
  },
};

export default nextConfig;
