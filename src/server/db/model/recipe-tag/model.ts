import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import {
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey
} from '@/server/db/model/model-cache';
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
    async getAll(language: string, ttl?: number): Promise<TagListDTO[] | null> {
        log.trace('Getting all recipe tags with categories', { language });

        const cacheKey = generateCacheKey('recipe-tag', 'findMany', {
            where: { language }
        });

        const tags = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching all recipe tags with categories from db');
                return prisma.tag.findMany({
                    include: {
                        category: true,
                        translations: {
                            where: { language },
                            select: { name: true }
                        }
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

            const translatedName =
                tag.translations?.[0]?.name ?? tag.slug ?? tag.slug;

            if (existingCategory) {
                existingCategory.tags.push({
                    id: tag.id,
                    name: translatedName,
                    categoryId: tag.categoryId as CategoryId
                });
            } else {
                acc.push({
                    category,
                    tags: [
                        {
                            id: tag.id,
                            name: translatedName,
                            categoryId: tag.categoryId as CategoryId
                        }
                    ]
                });
            }
            return acc;
        }, [] as TagListDTO[]);
    }

    async getManyBySlugs(
        slugs: string[],
        language: string
    ): Promise<RecipeTagDTO[]> {
        log.trace('Getting tags by slugs', { slugs, language });

        const tags = await prisma.tag.findMany({
            where: { slug: { in: slugs } },
            include: {
                translations: {
                    where: { language },
                    select: { name: true }
                }
            }
        });

        return tags.map((tag) => ({
            id: tag.id,
            name: tag.translations?.[0]?.name ?? tag.slug,
            categoryId: tag.categoryId as CategoryId
        }));
    }
}

const recipeTagModel = new RecipeTagModel();
export default recipeTagModel;
