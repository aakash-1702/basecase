import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Auto-memoises components/hooks so large client trees (problem editor,
  // interview room) stop re-rendering on every unrelated state change.
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error", "warn"] } : false,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "date-fns", "recharts"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
