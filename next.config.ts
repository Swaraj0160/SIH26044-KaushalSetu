import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack doesn't walk up into the home directory
  // looking for a lockfile.
  turbopack: {
    root: path.resolve(),
  },
  reactCompiler: true,
  // Fail the production build on type errors (default, stated explicitly).
  typescript: { ignoreBuildErrors: false },
};

export default nextConfig;
