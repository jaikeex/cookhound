/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',

    serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg'],

    allowedDevOrigins: [
        '192.168.0.143',
        '192.168.0.*',
        '192.168.1.*',
        '10.0.0.*',
        '172.16.*.*'
    ],

    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'lh3.googleusercontent.com',
                port: '',
                pathname: '/**'
            },
            {
                protocol: 'https',
                hostname: 'storage.googleapis.com',
                port: '',
                pathname: '/**'
            }
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [320, 420, 768, 1024, 1200],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 31536000
    },

    turbopack: {
        rules: {
            '*.svg': {
                loaders: [{ loader: '@svgr/webpack', options: { icon: true } }],
                as: '*.js'
            }
        }
    },

    experimental: {
        optimizeCss: true,
        optimizePackageImports: ['@/client/components']
    },

    logging: {
        incomingRequests: false,
        outgoingResponses: false
    },

    webpack(config) {
        // Grab the existing rule that handles SVG imports
        const fileLoaderRule = config.module.rules.find((rule) =>
            rule.test?.test?.('.svg')
        );

        config.module.rules.push(
            // Reapply the existing rule, but only for svg imports ending in ?url
            {
                ...fileLoaderRule,
                test: /\.svg$/i,
                resourceQuery: /url/ // *.svg?url
            },
            // Convert all other *.svg imports to React components
            {
                test: /\.svg$/i,
                issuer: fileLoaderRule.issuer,
                resourceQuery: {
                    not: [...fileLoaderRule.resourceQuery.not, /url/]
                }, // exclude if *.svg?url
                use: [
                    {
                        loader: '@svgr/webpack',
                        options: {
                            icon: true
                        }
                    }
                ]
            }
        );

        // Modify the file loader rule to ignore *.svg, since we have it handled now.
        fileLoaderRule.exclude = /\.svg$/i;

        return config;
    }
};

export default nextConfig;
