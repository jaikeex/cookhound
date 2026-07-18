import type { MetadataRoute } from 'next';
import { ENV_CONFIG_PUBLIC, ROUTES } from '@/common/constants';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = ENV_CONFIG_PUBLIC.ORIGIN;

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    `${ROUTES.auth.callback.root}/`,
                    `${ROUTES.error.root}/`,
                    ROUTES.shoppingList,
                    ROUTES.recipe.create,
                    ROUTES.user.changeEmail
                ]
            },
            {
                userAgent: [
                    'GPTBot',
                    'CCBot',
                    'PerplexityBot',
                    'pbot',
                    'ClaudeBot',
                    'Claude-Web',
                    'Google-Extended',
                    'Amazonbot',
                    'Bytespider',
                    'YouBot',
                    'youcrawl',
                    'Applebot-Extended',
                    'AhrefsBot-LLM',
                    'StabilityAI',
                    'cohere-ai',
                    'SerpAPI',
                    'Diffbot',
                    'MiqroBot'
                ],
                disallow: ['/']
            }
        ],
        sitemap: `${baseUrl}/sitemap.xml`
    };
}
