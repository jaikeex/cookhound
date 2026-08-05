import type { MetadataRoute } from 'next';
import {
    ENV_CONFIG_PUBLIC,
    HUB_SLUGS,
    HUB_INDEXABLE_THRESHOLD,
    ROUTES,
    buildHubPath
} from '@/common/constants';
import type { HubDbSlug } from '@/common/constants';
import { prisma } from '@/server/integrations';
import { recipeTagService } from '@/server/services';
import { Logger } from '@/server/logger';

export const revalidate = 86400; // 24 hours

const log = Logger.getInstance('sitemap');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = ENV_CONFIG_PUBLIC.ORIGIN;

    try {
        log.trace('Generating sitemap');

        const [recipes, cookbooks, users, hubLookup] = await Promise.all([
            fetchPublicRecipes(),
            fetchPublicCookbooks(),
            fetchPublicUsers(),
            fetchIndexableHubs()
        ]);

        // null means the lookup itself failed, which is not the same statement
        // as "no hub qualifies" - see the index entry below.
        const hubs = hubLookup ?? [];

        log.trace('Fetched sitemap data', {
            recipesCount: recipes.length,
            cookbooksCount: cookbooks.length,
            usersCount: users.length,
            hubsCount: hubs.length,
            hubLookupFailed: hubLookup === null
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
                        cs: `${baseUrl}`
                    }
                }
            },
            {
                url: `${baseUrl}${ROUTES.search()}`,
                lastModified: new Date(),
                changeFrequency: 'daily',
                priority: 0.8,
                alternates: {
                    languages: {
                        cs: `${baseUrl}${ROUTES.search()}`
                    }
                }
            },
            // Submitted only while it has something to list. With no hub past
            // the threshold the index renders an empty state and marks itself
            // noindex (see its generateMetadata), and submitting a url the
            // page itself tells crawlers to drop is a contradiction that costs
            // crawl budget on a thin page.
            ...(hubLookup === null || hubs.length > 0
                ? [
                      {
                          url: `${baseUrl}${ROUTES.hub.index}`,
                          lastModified: new Date(),
                          changeFrequency: 'weekly' as const,
                          priority: 0.7,
                          alternates: {
                              languages: {
                                  cs: `${baseUrl}${ROUTES.hub.index}`
                              }
                          }
                      }
                  ]
                : []),
            {
                url: `${baseUrl}${ROUTES.terms}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
                alternates: {
                    languages: {
                        cs: `${baseUrl}${ROUTES.terms}`
                    }
                }
            },
            {
                url: `${baseUrl}${ROUTES.privacy}`,
                lastModified: new Date(),
                changeFrequency: 'monthly',
                priority: 0.5,
                alternates: {
                    languages: {
                        cs: `${baseUrl}${ROUTES.privacy}`
                    }
                }
            }
        ];

        log.trace('Generating recipe pages');

        const recipePages: MetadataRoute.Sitemap = recipes.map((recipe) => ({
            url: `${baseUrl}${ROUTES.recipe.detail(recipe.displayId, recipe.title)}`,
            lastModified: new Date(recipe.updatedAt || recipe.createdAt),
            changeFrequency: 'weekly',
            priority: 0.9,
            alternates: {
                languages: {
                    cs: `${baseUrl}${ROUTES.recipe.detail(recipe.displayId, recipe.title)}`
                }
            }
        }));

        log.trace('Generating cookbook pages');

        const cookbookPages: MetadataRoute.Sitemap = cookbooks.map(
            (cookbook) => ({
                url: `${baseUrl}${ROUTES.cookbook.detail(cookbook.displayId)}`,
                lastModified: new Date(
                    cookbook.updatedAt || cookbook.createdAt
                ),
                changeFrequency: 'weekly',
                priority: 0.7,
                alternates: {
                    languages: {
                        cs: `${baseUrl}${ROUTES.cookbook.detail(cookbook.displayId)}`
                    }
                }
            })
        );

        log.trace('Generating user pages');

        const userPages: MetadataRoute.Sitemap = users.map((user) => ({
            url: `${baseUrl}${ROUTES.user.detail(user.id)}`,
            lastModified: new Date(user.updatedAt || user.createdAt),
            changeFrequency: 'weekly',
            priority: 0.6,
            alternates: {
                languages: {
                    cs: `${baseUrl}${ROUTES.user.detail(user.id)}`
                }
            }
        }));

        log.trace('Generating hub pages');

        const hubPages: MetadataRoute.Sitemap = hubs.map((hub) => ({
            url: `${baseUrl}${buildHubPath(hub.hubSlug, 1)}`,
            lastModified: new Date(hub.lastModified),
            changeFrequency: 'weekly',
            priority: 0.8,
            alternates: {
                languages: {
                    cs: `${baseUrl}${buildHubPath(hub.hubSlug, 1)}`
                }
            }
        }));

        return [
            ...staticPages,
            ...hubPages,
            ...recipePages,
            ...cookbookPages,
            ...userPages
        ];
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

async function fetchIndexableHubs(): Promise<Array<{
    hubSlug: string;
    lastModified: string;
}> | null> {
    try {
        log.trace('Fetching indexable hubs for sitemap');

        const rows = await recipeTagService.listIndexableHubs(
            HUB_INDEXABLE_THRESHOLD
        );

        log.trace('Fetched indexable hubs', { count: rows.length });

        return rows.flatMap((row) => {
            const hubSlug = HUB_SLUGS[row.slug as HubDbSlug];

            // A db tag without a hub mapping has no page, skip it.
            if (!hubSlug) {
                return [];
            }

            return [
                {
                    hubSlug,
                    lastModified: row.lastModified.toISOString()
                }
            ];
        });
    } catch (error: unknown) {
        log.error('Failed to fetch indexable hubs for sitemap', { error });
        return null;
    }
}

async function fetchPublicRecipes(): Promise<
    Array<{
        displayId: string;
        title: string;
        updatedAt?: string;
        createdAt: string;
    }>
> {
    try {
        log.trace('Fetching public recipes for sitemap');

        const recipes = await prisma.recipe.findMany({
            // flagged recipes are hidden from every public list
            where: {
                flags: { none: { active: true } }
            },
            select: {
                displayId: true,
                title: true,
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
            title: recipe.title,
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
