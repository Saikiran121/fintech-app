import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // Required for secure multi-stage Docker build
};

export default nextConfig;
