import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // Pin the workspace root to this project (a stray lockfile lives in $HOME).
    root: __dirname,
  },
};

export default nextConfig;
