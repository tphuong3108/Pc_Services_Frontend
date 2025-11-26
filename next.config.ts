import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    webpack(config, { isServer }) {
        // Disable canvas on client bundle
        if (!isServer){
            config.resolve = config.resolve || {};
            config.resolve.alias = config.resolve.alias || {};
            config.resolve.alias["canvas"] = false;
        }

        // Add SVG loader
        config.module = config.module || {};
        config.module.rules ||= [];

        config.module.rules.push({
            test: /\.svg$/i,
            issuer: /\.[jt]sx?$/,
            use: ["@svgr/webpack"],
        });

        return config;
    },

    images: {
        domains: [
            "res.cloudinary.com",
            "picsum.photos",
            "loremflickr.com",
        ],
    },
};

export default nextConfig;
