import type { Ingredient } from '@/server/db/generated/prisma/client';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import {
    CACHE_TAGS,
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey
} from '@/server/db/model/model-cache';

//|=============================================================================================|//

const log = Logger.getInstance('ingredient-model');

class IngredientModel {
    //~=========================================================================================~//
    //$                                          QUERIES                                        $//
    //~=========================================================================================~//

    /**
     * Get an ingredient by id
     * Query class -> C2
     */
    async getOneById(id: number, ttl?: number): Promise<Ingredient | null> {
        log.trace('Getting ingredient by id', { id });

        const cacheKey = generateCacheKey('ingredient', 'findUnique', {
            where: { id }
        });

        const ingredient = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching ingredient from db by id', { id });
                return prisma.ingredient.findUnique({ where: { id } });
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return ingredient;
    }

    /**
     * Get all ingredients, sorted alphabetically.
     *
     * Query class -> C2
     */
    async getAll(ttl?: number): Promise<{ id: number; name: string }[]> {
        log.trace('Getting all ingredients');

        const cacheKey = generateCacheKey('ingredient', 'findMany', {});

        const ingredients = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching all ingredients from db');

                return prisma.ingredient.findMany({
                    select: { id: true, name: true },
                    orderBy: { name: 'asc' },
                    take: 5000
                });
            },
            ttl ?? CACHE_TTL.TTL_2,
            [CACHE_TAGS.ingredient.all()]
        );

        return ingredients;
    }
}

const ingredientModel = new IngredientModel();
export default ingredientModel;
