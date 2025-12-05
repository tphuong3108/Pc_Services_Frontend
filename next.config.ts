import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack(config) {
        // Quan trọng: alias áp dụng cho cả server & client
        config.resolve.alias = {
            ...(config.resolve.alias || {}),
            canvas: false,
        };

        // SVG loader giữ nguyên
        config.module.rules ||= [];
        config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ["@svgr/webpack"],
        });

        return config;
    },
    images: {
    remotePatterns: [
        {
        protocol: "https",
        hostname: "pc-services-backend-uff9.onrender.com",
        pathname: "/**",
        },
    ],
    },
};

export default nextConfig;
