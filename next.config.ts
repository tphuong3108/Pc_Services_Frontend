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
        // Allow images from any external hostname and disable Next.js
        // image optimization so the app will accept images without
        // domain restrictions or size limits.
        remotePatterns: [
            { protocol: "https", hostname: "**", port: "", pathname: "/**" },
            { protocol: "http", hostname: "**", port: "", pathname: "/**" },
        ],
        dangerouslyAllowSVG: true,
        contentSecurityPolicy: "default-src 'self'; img-src 'self' data: blob: *;",
        unoptimized: true,
    },
};

export default nextConfig;
