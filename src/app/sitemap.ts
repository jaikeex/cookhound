import type { MetadataRoute } from 'next';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';

export const revalidate = 86400; // 24 hours

const log = Logger.getInstance('sitemap');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = ENV_CONFIG_PUBLIC.ORIGIN;

    try {
        log.trace('Generating sitemap');

        const [recipes, cookbooks, users] = await Promise.all([
            fetchPublicRecipes(),
            fetchPublicCookbooks(),
            fetchPublicUsers()
        ]);

        log.trace('Fetched sitemap data', {
            recipesCount: recipes.length,
            cookbooksCount: cookbooks.length,
            usersCount: users.length
        });

        log.trace('Generating static pages');

        const staticPages: MetadataRoute.Sitemap = [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0,
                alternates: {
                    languages: {
                        en: `${baseUrl}`,
                        cs: `${baseUrl}`
                    }
                }
            },
            {
                url: `${baseUrl}/search`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.8,
                alternates: {
                    languages: {
                        en: `${baseUrl}/search`,
                        cs: `${baseUrl}/search`
                    }
                }
            },
            {
                url: `${baseUrl}/terms`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
                alternates: {
                    languages: {
                        en: `${baseUrl}/terms`,
                        cs: `${baseUrl}/terms`
                    }
                }
            }
        ];

        log.trace('Generating recipe pages');

        const recipePages: MetadataRoute.Sitemap = recipes.map((recipe) => ({
            url: `${baseUrl}/recipe/${recipe.displayId}`,
            lastModified: new Date(recipe.updatedAt || recipe.createdAt),
            changeFrequency: 'weekly',
            priority: 0.9,
            alternates: {
                languages: {
                    en: `${baseUrl}/recipe/${recipe.displayId}`,
                    cs: `${baseUrl}/recipe/${recipe.displayId}`
                }
            }
        }));

        log.trace('Generating cookbook pages');

        const cookbookPages: MetadataRoute.Sitemap = cookbooks.map(
            (cookbook) => ({
                url: `${baseUrl}/cookbooks/${cookbook.displayId}`,
                lastModified: new Date(
                    cookbook.updatedAt || cookbook.createdAt
                ),
                changeFrequency: 'weekly',
                priority: 0.7,
                alternates: {
                    languages: {
                        en: `${baseUrl}/cookbooks/${cookbook.displayId}`,
                        cs: `${baseUrl}/cookbooks/${cookbook.displayId}`
                    }
                }
            })
        );

        log.trace('Generating user pages');

        const userPages: MetadataRoute.Sitemap = users.map((user) => ({
            url: `${baseUrl}/user/${user.id}`,
            lastModified: new Date(user.updatedAt || user.createdAt),
            changeFrequency: 'weekly',
            priority: 0.6,
            alternates: {
                languages: {
                    en: `${baseUrl}/user/${user.id}`,
                    cs: `${baseUrl}/user/${user.id}`
                }
            }
        }));

        return [...staticPages, ...recipePages, ...cookbookPages, ...userPages];
    } catch (error: unknown) {
        log.error('Failed to generate sitemap', { error });

        // Return minimal sitemap on error to ensure site remains crawlable
        return [
            {
                url: baseUrl,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 1.0
            }
        ];
    }
}

async function fetchPublicRecipes(): Promise<
    Array<{
        displayId: string;
        updatedAt?: string;
        createdAt: string;
    }>
> {
    try {
        log.trace('Fetching public recipes for sitemap');

        const recipes = await prisma.recipe.findMany({
            select: {
                displayId: true,
                updatedAt: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        log.trace('Fetched public recipes', { count: recipes.length });

        return recipes.map((recipe) => ({
            displayId: recipe.displayId,
            updatedAt: recipe.updatedAt.toISOString(),
            createdAt: recipe.createdAt.toISOString()
        }));
    } catch (error: unknown) {
        log.error('Failed to fetch public recipes for sitemap', { error });
        return [];
    }
}

async function fetchPublicCookbooks(): Promise<
    Array<{
        displayId: string;
        updatedAt?: string;
        createdAt: string;
    }>
> {
    try {
        log.trace('Fetching public cookbooks for sitemap');

        const cookbooks = await prisma.cookbook.findMany({
            where: {
                visibility: 'PUBLIC'
            },
            select: {
                displayId: true,
                updatedAt: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        log.trace('Fetched public cookbooks', { count: cookbooks.length });

        return cookbooks.map((cookbook) => ({
            displayId: cookbook.displayId,
            updatedAt: cookbook.updatedAt.toISOString(),
            createdAt: cookbook.createdAt.toISOString()
        }));
    } catch (error: unknown) {
        log.error('Failed to fetch public cookbooks for sitemap', { error });
        return [];
    }
}

async function fetchPublicUsers(): Promise<
    Array<{
        id: number;
        updatedAt?: string;
        createdAt: string;
    }>
> {
    try {
        log.trace('Fetching active users for sitemap');

        const users = await prisma.user.findMany({
            where: {
                status: 'active'
            },
            select: {
                id: true,
                updatedAt: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        log.trace('Fetched active users', { count: users.length });

        return users.map((user) => ({
            id: user.id,
            updatedAt: user.updatedAt.toISOString(),
            createdAt: user.createdAt.toISOString()
        }));
    } catch (error: unknown) {
        log.error('Failed to fetch active users for sitemap', { error });
        return [];
    }
}
