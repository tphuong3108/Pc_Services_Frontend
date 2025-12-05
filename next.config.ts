import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // ⚡ Rule cho phép sử dụng SVG như React Component khi dùng '?svgr'
    config.module.rules.push({
      test: /\.svg$/i,
      resourceQuery: /svgr/, // chỉ apply khi import *.svg?svgr
      use: ["@svgr/webpack"],
    });

    // ⚡ Còn lại các file SVG sẽ được Next xử lý như asset → dùng được với <Image>
    config.module.rules.push({
      test: /\.svg$/i,
      type: "asset",
      resourceQuery: { not: [/svgr/] },
    });

    return config;
  },

  images: {
    unoptimized: true,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
