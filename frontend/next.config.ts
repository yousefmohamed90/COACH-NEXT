import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@trainova/api-client", "@trainova/schemas", "@trainova/database"],
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default nextConfig;
