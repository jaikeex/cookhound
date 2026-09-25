const isDev = process.env.NODE_ENV !== 'production';

const cspHeaderKey = 'Content-Security-Policy';
const contentSecurityPolicy = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''} https://www.google.com https://www.gstatic.com https://www.googletagmanager.com`,
    "style-src 'self' 'unsafe-inline'",
    // *.google-analytics.com covers the GA4 regional endpoints (region1.google-analytics.com etc.)
    "img-src 'self' data: blob: https://storage.googleapis.com https://lh3.googleusercontent.com https://www.gstatic.com https://*.google-analytics.com https://www.googletagmanager.com",
    "font-src 'self' data:",
    `connect-src 'self'${isDev ? ' ws:' : ''} https://www.google.com https://*.google-analytics.com https://*.analytics.google.com https://www.googletagmanager.com`,
    'frame-src https://www.google.com',
    "manifest-src 'self'",
    ...(isDev ? [] : ['upgrade-insecure-requests'])
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone',

    async redirects() {
        return [
            {
                source: '/recipe/:path*',
                destination: '/recept/:path*',
                permanent: true
            },
            {
                source: '/cookbooks/:path*',
                destination: '/kucharky/:path*',
                permanent: true
            },
            {
                source: '/user/:path*',
                destination: '/profil/:path*',
                permanent: true
            },
            {
                source: '/search',
                destination: '/vyhledavani',
                permanent: true
            },
            {
                source: '/filter',
                destination: '/filtr',
                permanent: true
            },
            {
                source: '/terms',
                destination: '/podminky',
                permanent: true
            },
            {
                source: '/privacy',
                destination: '/soukromi',
                permanent: true
            },
            {
                source: '/contact',
                destination: '/kontakt',
                permanent: true
            },
            {
                source: '/shopping-list',
                destination: '/nakupni-seznam',
                permanent: true
            },
            {
                source: '/auth/login',
                destination: '/auth/prihlaseni',
                permanent: true
            },
            {
                source: '/auth/register',
                destination: '/auth/registrace',
                permanent: true
            },
            {
                source: '/auth/reset-password',
                destination: '/auth/reset-hesla',
                permanent: true
            }
        ];
    },

    async headers() {
        return [
            {
                source: '/:path*',
                headers: [
                    { key: cspHeaderKey, value: contentSecurityPolicy },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'X-Frame-Options', value: 'DENY' },
                    {
                        key: 'Referrer-Policy',
                        value: 'strict-origin-when-cross-origin'
                    },
                    {
                        key: 'Permissions-Policy',
                        value: 'camera=(), microphone=(), geolocation=()'
                    }
                ]
            }
        ];
    },

    serverExternalPackages: ['@prisma/client', '@prisma/adapter-pg', 'bullmq'],

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
        optimizePackageImports: [
            '@/client/components',
            '@/client/utils',
            '@/client/hooks'
        ],
        cpus: 4,
        staticGenerationMaxConcurrency: 2
    },

    logging: {
        incomingRequests: false,
        outgoingResponses: false
    },

    webpack(config, { isServer }) {
        //I used this for bundle size investigations. Leaving it here for reference.
        if (process.env.DUMP_STATS && !isServer) {
            config.plugins.push({
                apply(compiler) {
                    compiler.hooks.done.tap('DumpStats', (stats) => {
                        const json = stats.toJson({
                            all: false,
                            chunks: true,
                            chunkModules: true,
                            modules: true,
                            cachedModules: true,
                            reasons: true,
                            entrypoints: true,
                            ids: true,
                            nestedModules: true
                        });
                        import('fs').then((fs) =>
                            fs.writeFileSync(
                                process.env.DUMP_STATS,
                                JSON.stringify(json)
                            )
                        );
                    });
                }
            });
        }

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
