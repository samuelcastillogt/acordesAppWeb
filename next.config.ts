import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/*": ["./data/snapshot/**/*"],
  },
};

export default nextConfig;
