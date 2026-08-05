import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import {
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey
} from '@/server/db/model/model-cache';
import { getIndexableHubs } from '@/server/db/generated/prisma/sql';
import type {
    RecipeTagCategory,
    RecipeTagDTO,
    TagListDTO,
    CategoryId
} from '@/common/types';

//|=============================================================================================|//

const log = Logger.getInstance('recipe-tag-model');

class RecipeTagModel {
    //~=========================================================================================~//
    //$                                          QUERIES                                        $//
    //~=========================================================================================~//

    /**
     * Get all recipe tags grouped by category
     * Query class -> C2
     */
    async getAll(ttl?: number): Promise<TagListDTO[] | null> {
        log.trace('Getting all recipe tags with categories');

        const cacheKey = generateCacheKey('recipe-tag', 'findMany', {});

        const tags = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching all recipe tags with categories from db');
                return prisma.tag.findMany({
                    include: {
                        category: true
                    }
                });
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return tags.reduce((acc: TagListDTO[], tag) => {
            const category = tag.category.name as RecipeTagCategory;
            const existingCategory = acc.find(
                (item) => item.category === category
            );

            if (existingCategory) {
                existingCategory.tags.push({
                    id: tag.id,
                    name: tag.name,
                    categoryId: tag.categoryId as CategoryId
                });
            } else {
                acc.push({
                    category,
                    tags: [
                        {
                            id: tag.id,
                            name: tag.name,
                            categoryId: tag.categoryId as CategoryId
                        }
                    ]
                });
            }
            return acc;
        }, [] as TagListDTO[]);
    }

    /**
     * Get a single tag by its unique slug.
     *
     * Query class -> C2
     */
    async getBySlug(slug: string, ttl?: number): Promise<RecipeTagDTO | null> {
        log.trace('Getting tag by slug', { slug });

        const cacheKey = generateCacheKey('recipe-tag', 'getBySlug', {
            slug
        });

        const tag = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching tag by slug from db', { slug });
                return prisma.tag.findUnique({
                    where: { slug }
                });
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        if (!tag) {
            return null;
        }

        return {
            id: tag.id,
            name: tag.name,
            categoryId: tag.categoryId as CategoryId
        };
    }

    async getManyBySlugs(slugs: string[]): Promise<RecipeTagDTO[]> {
        log.trace('Getting tags by slugs', { slugs });

        const tags = await prisma.tag.findMany({
            where: { slug: { in: slugs } }
        });

        return tags.map((tag) => ({
            id: tag.id,
            name: tag.name,
            categoryId: tag.categoryId as CategoryId
        }));
    }

    /**
     * Get tag slugs eligible for indexing as hub pages, together with their
     * non-flagged recipe count and the most recent update time among those
     * recipes.
     *
     * Query class -> C2
     */
    async getIndexableHubs(
        threshold: number,
        ttl?: number
    ): Promise<
        Array<{ slug: string; recipeCount: number; lastModified: Date }>
    > {
        log.trace('Getting indexable hubs', { threshold });

        // v2: the cached row shape gained recipeCount. Entries written by the
        // previous release lack the field and would be dropped wholesale by the
        // guard below, so the shape change gets its own key.
        // This is temporary and can be reverted in a future release.
        const cacheKey = generateCacheKey('recipe-tag', 'getIndexableHubs', {
            threshold,
            v: 2
        });

        const rows = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching indexable hubs from db', {
                    threshold
                });
                return prisma.$queryRawTyped(getIndexableHubs(threshold));
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        // The cache round-trips through JSON, so lastModified is a Date on a
        // miss but an ISO string on a hit. Revived here so the declared Date
        // holds on both paths - callers do call Date methods on it,
        // the sitemap needs toISOString.
        const hubs = rows.flatMap((row) =>
            row.lastModified != null && row.recipeCount != null
                ? [
                      {
                          slug: row.slug,
                          recipeCount: row.recipeCount,
                          lastModified: new Date(row.lastModified)
                      }
                  ]
                : []
        );

        if (hubs.length !== rows.length) {
            log.warn('Dropped malformed indexable hub rows', {
                threshold,
                fetched: rows.length,
                kept: hubs.length
            });
        }

        return hubs;
    }
}

const recipeTagModel = new RecipeTagModel();
export default recipeTagModel;
