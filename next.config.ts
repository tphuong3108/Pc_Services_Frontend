import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // ⚡ SVG as React Component when using ?svgr
    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: /svgr/, 
      use: ["@svgr/webpack"],
    });

    // ⚡ SVG as file asset (for next/image)
    config.module.rules.push({
      test: /\.svg$/i,
      type: "asset",
      resourceQuery: { not: [/svgr/] },
    });

    // ⚠ FIX LỖI CANVAS KHI BUILD TRÊN VERCEL
    config.resolve.alias = {
      ...(config.resolve.alias || {}),
      canvas: false,
    };

    return config;
  },

  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
};

export default nextConfig;
