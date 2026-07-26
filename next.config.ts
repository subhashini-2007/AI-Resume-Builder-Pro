import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.resolve(__dirname),
  outputFileTracingExcludes: {
    "*": ["./.next/**/*"],
  },
};

export default nextConfig;
