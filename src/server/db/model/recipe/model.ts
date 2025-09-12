import type { RecipeFlagReason } from '@/common/constants';
import {
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey,
    invalidateModelCache
} from '@/server/db/model/model-cache';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import type { Prisma, Recipe } from '@prisma/client';
import {
    getRecipeByDisplayId,
    getRecipeById,
    getFrontPageRecipes,
    getManyRecipes,
    searchRecipes,
    getUserRecipes,
    searchUserRecipes
} from '@prisma/client/sql';

//|=============================================================================================|//

const log = Logger.getInstance('recipe-model');

class RecipeModel {
    //~=========================================================================================~//
    //$                                          QUERIES                                        $//
    //~=========================================================================================~//

    /**
     * Get a recipe by id
     * Query class -> C2
     */
    async getOneById(
        id: number,
        ttl?: number
    ): Promise<getRecipeById.Result | null> {
        const cacheKey = generateCacheKey('recipe', 'findUnique', {
            where: { id }
        });

        log.trace('Getting recipe by id', { id });

        const recipe = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching recipe from db by id', { id });
                return prisma.$queryRawTyped(getRecipeById(id));
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return recipe[0] ?? null;
    }

    /**
     * Get a recipe by display id
     * Query class -> C2
     */
    async getOneByDisplayId(
        displayId: string,
        ttl?: number
    ): Promise<getRecipeById.Result | null> {
        const cacheKey = generateCacheKey('recipe', 'findUnique', {
            where: { displayId }
        });

        log.trace('Getting recipe by display id', { displayId });

        const recipe = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching recipe from db by display id', {
                    displayId
                });
                return prisma.$queryRawTyped(getRecipeByDisplayId(displayId));
            },
            ttl ?? CACHE_TTL.TTL_2
        );

        return recipe[0] ?? null;
    }

    async getMany(
        language: string,
        limit: number,
        offset: number,
        ttl?: number
    ): Promise<getManyRecipes.Result[]> {
        const cacheKey = generateCacheKey('recipe', 'findMany', {
            language,
            limit,
            offset
        });

        log.trace('Getting many recipes', {
            language,
            limit,
            offset
        });

        const recipes = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching many recipes from db', {
                    language,
                    limit,
                    offset
                });

                return prisma.$queryRawTyped(
                    getManyRecipes(language, limit, offset)
                );
            },
            ttl ?? CACHE_TTL.TTL_1
        );

        return recipes;
    }

    async getManyForUser(
        userId: number,
        language: string,
        limit: number,
        offset: number,
        ttl?: number
    ): Promise<getUserRecipes.Result[]> {
        const cacheKey = generateCacheKey('recipe', 'findManyForUser', {
            userId,
            language,
            limit,
            offset
        });

        log.trace('Getting many recipes for user', {
            userId,
            language,
            limit,
            offset
        });

        const recipes = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching many recipes for user from db', {
                    userId,
                    language,
                    limit,
                    offset
                });

                return prisma.$queryRawTyped(
                    getUserRecipes(userId, language, limit, offset)
                );
            },
            ttl ?? CACHE_TTL.TTL_1
        );

        return recipes;
    }

    //~=========================================================================================~//
    //$                                 FRONT PAGE COLLECTION                                   $//
    //~=========================================================================================~//

    /**
     * Get many recipes for the front page
     * Query class -> C1
     */
    async getManyForFrontPage(
        language: string,
        limit: number,
        offset: number,
        minTimesRated: number,
        ttl?: number
    ): Promise<getFrontPageRecipes.Result[]> {
        const cacheKey = generateCacheKey('recipe', 'findManyFrontPage', {
            language,
            limit,
            offset,
            minTimesRated
        });

        log.trace('Getting front page recipes', {
            language,
            limit,
            offset,
            minTimesRated
        });

        const recipes = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching front page recipes from db', {
                    language,
                    limit,
                    offset,
                    minTimesRated
                });
                return prisma.$queryRawTyped(
                    getFrontPageRecipes(minTimesRated, language, limit, offset)
                );
            },
            ttl ?? CACHE_TTL.TTL_1
        );

        return recipes;
    }

    //~=========================================================================================~//
    //$                                 TEXT SEARCH COLLECTION                                  $//
    //~=========================================================================================~//

    /**
     * Search for recipes by text. Exlcludes recipes with an active flag.
     * Query class -> C1
     */
    async searchManyByText(
        searchTerm: string,
        language: string,
        limit: number,
        offset: number,
        ttl?: number
    ): Promise<searchRecipes.Result[]> {
        const cacheKey = generateCacheKey('recipe', 'search', {
            searchTerm,
            language,
            limit,
            offset
        });

        log.trace('Searching recipes', {
            searchTerm,
            language,
            limit,
            offset
        });

        const recipes = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching searched recipes from db', {
                    searchTerm,
                    language,
                    limit,
                    offset
                });

                return prisma.$queryRawTyped(
                    searchRecipes(
                        language,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        limit,
                        offset
                    )
                );
            },
            ttl ?? CACHE_TTL.TTL_1
        );

        return recipes;
    }

    /**
     * Search for recipes by text for a specific user. Includes recipes with active flags and their flag information.
     * Query class -> C1
     */
    async searchManyByTextForUser(
        userId: number,
        searchTerm: string,
        language: string,
        limit: number,
        offset: number,
        ttl?: number
    ): Promise<searchUserRecipes.Result[]> {
        const cacheKey = generateCacheKey('recipe', 'searchForUser', {
            userId,
            searchTerm,
            language,
            limit,
            offset
        });

        log.trace('Searching recipes for user', {
            userId,
            searchTerm,
            language,
            limit,
            offset
        });

        const recipes = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching searched recipes for user from db', {
                    userId,
                    searchTerm,
                    language,
                    limit,
                    offset
                });

                return prisma.$queryRawTyped(
                    searchUserRecipes(
                        userId,
                        language,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        searchTerm,
                        limit,
                        offset
                    )
                );
            },
            ttl ?? CACHE_TTL.TTL_1
        );

        return recipes;
    }

    //~=========================================================================================~//
    //$                                         MUTATIONS                                       $//
    //~=========================================================================================~//

    /**
     * Create a new recipe
     * Write class -> W3
     */
    async createOne(data: {
        recipe: Omit<
            Prisma.RecipeCreateInput,
            'instructions' | 'ingredients' | 'author'
        >;
        authorId: number;
        instructions: string[];
        ingredients: { name: string; quantity: string | null }[];
        tags: { id: number }[];
    }): Promise<Recipe> {
        log.trace('Creating recipe', {
            title: data.recipe.title,
            authorId: data.authorId,
            language: data.recipe.language
        });

        return await prisma.$transaction(async (tx) => {
            log.trace('Creating recipe object', {
                title: data.recipe.title,
                authorId: data.authorId
            });

            const recipe = await tx.recipe.create({
                data: {
                    ...data.recipe,
                    author: {
                        connect: {
                            id: data.authorId
                        }
                    }
                }
            });

            log.trace('Creating instructions', { recipeId: recipe.id });

            if (data.instructions.length > 0) {
                await tx.instruction.createMany({
                    data: data.instructions.map((text, index) => ({
                        recipeId: recipe.id,
                        step: index + 1,
                        text
                    }))
                });
            }

            log.trace('Creating ingredients', { recipeId: recipe.id });

            if (data.ingredients.length > 0) {
                for (let i = 0; i < data.ingredients.length; i++) {
                    const ingredientData = data.ingredients[i];

                    // Only create ingredient if it doesn't already exist
                    let ingredient = await tx.ingredient.findFirst({
                        where: {
                            name: ingredientData.name,
                            language: (data.recipe as any).language || 'en'
                        }
                    });

                    if (!ingredient) {
                        ingredient = await tx.ingredient.create({
                            data: {
                                name: ingredientData.name,
                                language: (data.recipe as any).language || 'en'
                            }
                        });
                    }

                    // Create recipe-ingredient relation
                    await tx.recipeIngredient.create({
                        data: {
                            recipeId: recipe.id,
                            ingredientId: ingredient.id,
                            quantity: ingredientData.quantity,
                            ingredientOrder: i + 1
                        }
                    });
                }
            }

            log.trace('Creating tags', { recipeId: recipe.id });

            if (data.tags.length > 0) {
                await tx.recipeTag.createMany({
                    data: data.tags.map((tag) => ({
                        recipeId: recipe.id,
                        tagId: tag.id
                    }))
                });
            }

            log.trace('Recipe successfully created', { recipeId: recipe.id });

            return (await tx.recipe.findUnique({
                where: { id: recipe.id },
                include: {
                    ingredients: {
                        include: {
                            ingredient: true
                        }
                    },
                    instructions: true
                }
            })) as Recipe;
        });
    }

    /**
     * Update a recipe by id
     * Write class -> W1
     */
    async updateOneById(
        id: number,
        data: Prisma.RecipeUpdateInput
    ): Promise<Recipe> {
        log.trace('Updating recipe by id', { id });

        const recipe = await prisma.recipe.update({
            where: { id },
            data
        });

        await this.invalidateRecipeCache(recipe);

        return recipe;
    }

    /**
     * Increment the view count for a recipe
     * Write class -> W2
     */
    async incrementViewCount(id: number): Promise<void> {
        log.trace('Incrementing view count for recipe', { id });

        await prisma.recipe.update({
            where: { id },
            data: {
                timesViewed: {
                    increment: 1
                }
            }
        });
    }

    /**
     * Flag a recipe with the provided reason.
     *
     * Write class -> W1
     */
    async flagRecipe(
        recipeId: number,
        recipeDisplayId: string,
        userId: number,
        reason: RecipeFlagReason
    ): Promise<void> {
        log.trace('Flagging a recipe', { recipeId, userId, reason });

        await prisma.recipeFlag.create({
            data: {
                recipeId,
                userId,
                reason
            }
        });

        await this.invalidateRecipeCache({
            displayId: recipeDisplayId
        });
    }

    //~=========================================================================================~//
    //$                                      PRIVATE METHODS                                    $//
    //~=========================================================================================~//

    private async invalidateRecipeCache(
        changed: Partial<Recipe>,
        original?: Partial<Recipe>
    ) {
        await invalidateModelCache('recipe', changed, original ?? undefined);
    }
}

const recipeModel = new RecipeModel();
export default recipeModel;
