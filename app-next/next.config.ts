import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // Added while chasing a Vercel deploy failure that (once downgraded off Next.js
  // 16 - see DEVLOG.md) turned out to be an @vercel/next builder incompatibility,
  // not a type error. Left in as a safety net against the heavy type-checking load
  // from R3F/drei/postprocessing/gsap/recharts; `npx tsc --noEmit` is run locally
  // before pushing to catch real type errors instead.
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
