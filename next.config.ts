import type { NextConfig } from "next";

import { SONG_REDIRECTS } from "./lib/curation";

const nextConfig: NextConfig = {
  agentRules: false,
  poweredByHeader: false,
  outputFileTracingIncludes: {
    "/*": ["./data/snapshot/**/*"],
  },
  async redirects() {
    return SONG_REDIRECTS.map((redirect) => ({ ...redirect, permanent: true }));
  },
};

export default nextConfig;
