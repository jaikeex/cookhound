import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import {
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey
} from '@/server/db/model/model-cache';
import type { RecipeTagCategory, TagListDTO } from '@/common/types';

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

        const cacheKey = generateCacheKey('recipe-tag', 'findMany', {
            where: {}
        });

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

        return tags.reduce((acc, tag) => {
            const category = tag.category.name as RecipeTagCategory;
            const existingCategory = acc.find(
                (item) => item.category === category
            );

            if (existingCategory) {
                existingCategory.tags.push({
                    id: tag.id,
                    name: tag.name,
                    categoryId: tag.categoryId
                });
            } else {
                acc.push({
                    category,
                    tags: [
                        {
                            id: tag.id,
                            name: tag.name,
                            categoryId: tag.categoryId
                        }
                    ]
                });
            }
            return acc;
        }, [] as TagListDTO[]);
    }
}

const recipeTagModel = new RecipeTagModel();
export default recipeTagModel;
