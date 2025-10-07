import type { MetadataRoute } from 'next';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = ENV_CONFIG_PUBLIC.ORIGIN;

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/auth/callback/',
                    '/error/',
                    '/shopping-list',
                    '/recipe/create',
                    '/user/change-email'
                ]
            },
            {
                userAgent: 'GPTBot', // OpenAI crawler
                disallow: ['/']
            },
            {
                userAgent: 'CCBot', // Common Crawl
                disallow: ['/']
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`
    };
}
