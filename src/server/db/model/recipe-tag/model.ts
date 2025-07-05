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
    async getAll(language: string, ttl?: number): Promise<TagListDTO[] | null> {
        log.trace('Getting all recipe tags with categories', { language });

        const cacheKey = generateCacheKey('recipe-tag', 'findMany', {
            where: { language }
        });

        const tags: AwaitedReturn<typeof prisma.tag.findMany> =
            await cachePrismaQuery(
                cacheKey,
                async () => {
                    log.trace(
                        'Fetching all recipe tags with categories from db'
                    );
                    return prisma.tag.findMany({
                        include: {
                            category: true,
                            translations: {
                                where: { language },
                                select: { name: true }
                            }
                        }
                    } as any);
                },
                ttl ?? CACHE_TTL.TTL_2
            );

        return tags.reduce((acc: TagListDTO[], tag: any) => {
            const category = tag.category.name as RecipeTagCategory;
            const existingCategory = acc.find(
                (item) => item.category === category
            );

            const t = tag as any;
            const translatedName =
                t.translations?.[0]?.name ?? t.slug ?? t.name;

            if (existingCategory) {
                existingCategory.tags.push({
                    id: tag.id,
                    name: translatedName,
                    categoryId: tag.categoryId
                });
            } else {
                acc.push({
                    category,
                    tags: [
                        {
                            id: tag.id,
                            name: translatedName,
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
