import {
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey,
    invalidateModelCache
} from '@/server/db/model/model-cache';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import type { Prisma, Recipe } from '@prisma/client';
import { getRecipeById } from '@prisma/client/sql';
import { getRecipeByDisplayId } from '@prisma/client/sql';
import { getFrontPageRecipes } from '@prisma/client/sql';
import { searchRecipes } from '@prisma/client/sql';

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
            ttl ?? CACHE_TTL.TTL_2
        );

        return recipes;
    }

    //~=========================================================================================~//
    //$                                 TEXT SEARCH COLLECTION                                  $//
    //~=========================================================================================~//

    /**
     * Search for recipes by text
     * Query class -> C1
     */
    async searchManyByText(
        searchTerm: string,
        language: string,
        limit: number,
        offset: number,
        ttl?: number
    ): Promise<any[]> {
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
