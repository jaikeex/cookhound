import type { Ingredient } from '@/server/db/generated/prisma/client';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import {
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey
} from '@/server/db/model/model-cache';
import type { Locale } from '@/common/types';

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
     * Get an ingredient by name
     * Query class -> C2
     */
    async getOneByName(
        name: string,
        language: string,
        ttl?: number
    ): Promise<Ingredient | null> {
        log.trace('Getting ingredient by name', { name });

        const cacheKey = generateCacheKey('ingredient', 'findUnique', {
            where: { name, language }
        });

        const ingredient = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching ingredient from db by name', { name });
                return prisma.ingredient.findFirst({
                    where: { name, language }
                });
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return ingredient;
    }

    /**
     * Get all ingredients for a language, sorted alphabetically.
     * Query class -> C2
     */
    async getManyByLanguage(
        language: Locale,
        ttl?: number
    ): Promise<{ id: number; name: string }[]> {
        log.trace('Getting ingredients by language', { language });

        const cacheKey = generateCacheKey('ingredient', 'findManyByLanguage', {
            language
        });

        const ingredients = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching ingredients from db by language', {
                    language
                });

                return prisma.ingredient.findMany({
                    where: { language },
                    select: { id: true, name: true },
                    orderBy: { name: 'asc' },
                    take: 5000
                });
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return ingredients;
    }
}

const ingredientModel = new IngredientModel();
export default ingredientModel;
