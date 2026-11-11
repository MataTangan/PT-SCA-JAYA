
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [],
  turbopack: {
    root: "../",
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
