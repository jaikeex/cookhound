import {
    CACHE_TAGS,
    CACHE_TTL,
    cachePrismaQuery,
    generateCacheKey,
    invalidateTags
} from '@/server/db/model/model-cache';
import { NotFoundError } from '@/server/error';
import { ApplicationErrorCode } from '@/server/error/codes';
import { prisma } from '@/server/integrations';
import { Logger } from '@/server/logger';
import type { Prisma, Recipe } from '@/server/db/generated/prisma/client';
import type { RecipeFilterParams } from '@/common/types';
import {
    getRecipeByDisplayId,
    getRecipeById,
    getFrontPageRecipes,
    getManyRecipes,
    searchRecipes,
    getUserRecipes,
    searchUserRecipes
} from '@/server/db/generated/prisma/sql';

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
            ttl ?? CACHE_TTL.TTL_2,
            [CACHE_TAGS.recipe.entity(id)]
        );

        return this.reviveRecipeDates(recipe[0] ?? null);
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
            ttl ?? CACHE_TTL.TTL_2,
            [CACHE_TAGS.recipe.byDisplayId(displayId)]
        );

        return this.reviveRecipeDates(recipe[0] ?? null);
    }

    /**
     * Returns recipe based on its legacy display id (if it exists).
     * Query class -> C3 (this is not updated frequently but should be very rarely used)
     */
    async getOneByLegacyDisplayId(
        legacyDisplayId: string
    ): Promise<{ displayId: string; title: string } | null> {
        log.trace('Resolving recipe by legacy display id', {
            legacyDisplayId
        });

        return prisma.recipe.findUnique({
            where: { legacyDisplayId },
            select: { displayId: true, title: true }
        });
    }

    /**
     * List recipe display IDs eligible for static generation.
     * Excludes recipes with an active flag. Bounded to avoid unbounded build cost;
     * the long tail is served via on-demand rendering (Next.js `dynamicParams`).
     * Query class -> C2
     */
    async listDisplayIdsForStaticGeneration(
        limit = 5000,
        ttl?: number
    ): Promise<Array<{ displayId: string; title: string }>> {
        const cacheKey = generateCacheKey('recipe', 'listDisplayIdsForSSG.v2', {
            limit
        });

        log.trace('Listing recipe displayIds for SSG', { limit });

        return cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching recipe displayIds for SSG from db', {
                    limit
                });
                return prisma.recipe.findMany({
                    where: { flags: { none: { active: true } } },
                    select: { displayId: true, title: true },
                    orderBy: [
                        { rating: 'desc' },
                        { timesViewed: 'desc' },
                        { createdAt: 'desc' }
                    ],
                    take: limit
                });
            },
            ttl ?? CACHE_TTL.TTL_2
        );
    }

    async getMany(
        limit: number,
        offset: number,
        ttl?: number
    ): Promise<getManyRecipes.Result[]> {
        const cacheKey = generateCacheKey('recipe', 'findMany', {
            limit,
            offset
        });

        log.trace('Getting many recipes', {
            limit,
            offset
        });

        const recipes = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching many recipes from db', {
                    limit,
                    offset
                });

                return prisma.$queryRawTyped(getManyRecipes(limit, offset));
            },
            ttl ?? CACHE_TTL.TTL_1
        );

        return recipes;
    }

    async getManyForUser(
        userId: number,
        limit: number,
        offset: number,
        ttl?: number
    ): Promise<getUserRecipes.Result[]> {
        const cacheKey = generateCacheKey('recipe', 'findManyForUser', {
            userId,
            limit,
            offset
        });

        log.trace('Getting many recipes for user', {
            userId,
            limit,
            offset
        });

        const recipes = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching many recipes for user from db', {
                    userId,
                    limit,
                    offset
                });

                return prisma.$queryRawTyped(
                    getUserRecipes(userId, limit, offset)
                );
            },
            ttl ?? CACHE_TTL.TTL_1,
            [CACHE_TAGS.recipe.ownedBy(userId)]
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
        limit: number,
        offset: number,
        minTimesRated: number,
        ttl?: number
    ): Promise<getFrontPageRecipes.Result[]> {
        const cacheKey = generateCacheKey('recipe', 'findManyFrontPage', {
            limit,
            offset,
            minTimesRated
        });

        log.trace('Getting front page recipes', {
            limit,
            offset,
            minTimesRated
        });

        const recipes = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching front page recipes from db', {
                    limit,
                    offset,
                    minTimesRated
                });
                return prisma.$queryRawTyped(
                    getFrontPageRecipes(minTimesRated, limit, offset)
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
        limit: number,
        offset: number,
        ttl?: number
    ): Promise<searchRecipes.Result[]> {
        const cacheKey = generateCacheKey('recipe', 'search', {
            searchTerm,
            limit,
            offset
        });

        log.trace('Searching recipes', {
            searchTerm,
            limit,
            offset
        });

        const recipes = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching searched recipes from db', {
                    searchTerm,
                    limit,
                    offset
                });

                return prisma.$queryRawTyped(
                    searchRecipes(searchTerm, limit, offset)
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
        limit: number,
        offset: number,
        ttl?: number
    ): Promise<searchUserRecipes.Result[]> {
        const cacheKey = generateCacheKey('recipe', 'searchForUser', {
            userId,
            searchTerm,
            limit,
            offset
        });

        log.trace('Searching recipes for user', {
            userId,
            searchTerm,
            limit,
            offset
        });

        const recipes = await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching searched recipes for user from db', {
                    userId,
                    searchTerm,
                    limit,
                    offset
                });

                return prisma.$queryRawTyped(
                    searchUserRecipes(userId, searchTerm, limit, offset)
                );
            },
            ttl ?? CACHE_TTL.TTL_1,
            [CACHE_TAGS.recipe.ownedBy(userId)]
        );

        return recipes;
    }

    //~=========================================================================================~//
    //$                                    FILTER COLLECTION                                    $//
    //~=========================================================================================~//

    /**
     * Builds the shared where clause for the filter queries. filterMany and
     * countFiltered MUST stay on the same clause, the hub pages derive their
     * page count (and indexability) from countFiltered while listing through
     * filterMany, and a drift between the two would produce phantom pages.
     */
    private buildFilterWhere(
        filters: RecipeFilterParams
    ): Prisma.RecipeWhereInput {
        const andConditions: Prisma.RecipeWhereInput[] = [];

        filters.containsIngredients?.forEach((id) =>
            andConditions.push({
                ingredients: { some: { ingredientId: id } }
            })
        );

        filters.tags?.forEach((id) =>
            andConditions.push({ tags: { some: { tagId: id } } })
        );

        return {
            flags: { none: { active: true } },
            ...(andConditions.length && { AND: andConditions }),
            ...(filters.excludesIngredients?.length && {
                NOT: {
                    ingredients: {
                        some: {
                            ingredientId: {
                                in: filters.excludesIngredients
                            }
                        }
                    }
                }
            }),
            ...(filters.timeMin != null && {
                time: { gte: filters.timeMin }
            }),
            ...(filters.timeMax != null && {
                time: { lte: filters.timeMax }
            }),
            ...(filters.hasImage && { imageUrl: { not: null } })
        };
    }

    /**
     * Count recipes matching the provided criteria.
     * Query class -> C1
     */
    async countFiltered(
        filters: RecipeFilterParams,
        ttl?: number
    ): Promise<number> {
        const cacheKey = generateCacheKey('recipe', 'countFiltered', {
            filters
        });

        log.trace('Counting filtered recipes', { filters });

        return await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching filtered recipe count from db', {
                    filters
                });

                return prisma.recipe.count({
                    where: this.buildFilterWhere(filters)
                });
            },
            ttl ?? CACHE_TTL.TTL_1
        );
    }

    /**
     * Filter recipes by provided criteria.
     * Query class -> C1
     */
    async filterMany(
        filters: RecipeFilterParams,
        limit: number,
        offset: number,
        ttl?: number
    ): Promise<
        Prisma.RecipeGetPayload<{
            select: {
                id: true;
                displayId: true;
                title: true;
                imageUrl: true;
                rating: true;
                timesRated: true;
                time: true;
                portionSize: true;
                createdAt: true;
            };
        }>[]
    > {
        const cacheKey = generateCacheKey('recipe', 'filterMany', {
            filters,
            limit,
            offset
        });

        log.trace('Filtering recipes', { limit, offset, filters });

        return await cachePrismaQuery(
            cacheKey,
            async () => {
                log.trace('Fetching filtered recipes from db', {
                    limit,
                    offset
                });

                return prisma.recipe.findMany({
                    where: this.buildFilterWhere(filters),
                    select: {
                        id: true,
                        displayId: true,
                        title: true,
                        imageUrl: true,
                        rating: true,
                        timesRated: true,
                        time: true,
                        portionSize: true,
                        createdAt: true
                    },
                    orderBy: [
                        { rating: { sort: 'desc', nulls: 'last' } },
                        { createdAt: 'desc' }
                    ],
                    take: limit,
                    skip: offset
                });
            },
            ttl ?? CACHE_TTL.TTL_1
        );
    }

    //~=========================================================================================~//
    //$                                  ADMIN-FACING AGGREGATES                                $//
    ///
    //# These read methods are intentionally uncached. They feed admin dashboards that must
    //# always reflect live state.
    //~=========================================================================================~//

    /**
     * Count all recipes.
     * Query class -> C3
     */
    async countAll(): Promise<number> {
        log.trace('Counting recipes');

        return prisma.recipe.count();
    }

    /**
     * Count recipes created on or after the given timestamp.
     * Query class -> C3
     */
    async countCreatedSince(since: Date): Promise<number> {
        log.trace('Counting recipes created since', { since });

        return prisma.recipe.count({
            where: { createdAt: { gte: since } }
        });
    }

    /**
     * Return the most recently created recipes (newest first).
     * Query class -> C3
     */
    async getRecent(limit = 5) {
        log.trace('Getting recent recipes', { limit });

        return prisma.recipe.findMany({
            select: {
                id: true,
                displayId: true,
                title: true,
                createdAt: true,
                author: { select: { username: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
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
        ingredients: {
            name: string;
            quantity: string | null;
            category?: string | null;
        }[];
        tags: { id: number }[];
    }): Promise<Recipe> {
        log.trace('Creating recipe', {
            title: data.recipe.title,
            authorId: data.authorId
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
                // Calculate orders
                const categoryOrders = this.calculateCategoryOrders(
                    data.ingredients
                );

                const ingredientOrders = this.calculateIngredientOrders(
                    data.ingredients
                );

                if (!ingredientOrders || !Array.isArray(ingredientOrders)) {
                    return recipe;
                }

                for (let i = 0; i < data.ingredients.length; i++) {
                    const ingredientData = data.ingredients[i];

                    const categoryOrder = categoryOrders[i];
                    const ingredientOrder = ingredientOrders[i];

                    if (!ingredientData || ingredientOrder === undefined) {
                        continue;
                    }

                    // Only create ingredient if it doesn't already exist
                    let ingredient = await tx.ingredient.findUnique({
                        where: { name: ingredientData.name }
                    });

                    if (!ingredient) {
                        ingredient = await tx.ingredient.create({
                            data: { name: ingredientData.name }
                        });
                    }

                    // Create recipe-ingredient relation
                    await tx.recipeIngredient.create({
                        data: {
                            recipeId: recipe.id,
                            ingredientId: ingredient.id,
                            quantity: ingredientData.quantity,
                            category: ingredientData.category || null,
                            categoryOrder,
                            ingredientOrder
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

            log.trace('Recipe successfully created', {
                recipeId: recipe.id
            });

            await invalidateTags([CACHE_TAGS.recipe.ownedBy(data.authorId)]);

            return (await tx.recipe.findUnique({
                where: { id: recipe.id },
                include: {
                    ingredients: {
                        include: {
                            ingredient: true
                        },
                        orderBy: {
                            ingredientOrder: 'asc'
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
     *
     *? IMPORTANT: Passing any of the relation fields REPLACES the existing relations. The previous records
     *? are deleted and recreated in the same manner as when creating a new recipe. Omitting a relation
     *? field leaves that relation untouched.
     */
    async updateOneById(
        id: number,
        data: Prisma.RecipeUpdateInput & {
            instructions?: string[];
            ingredients?: {
                name: string;
                quantity: string | null;
                category?: string | null;
            }[];
            tags?: { id: number }[];
        }
    ): Promise<Recipe> {
        log.trace('Updating recipe by id', { id });

        // Extract relation data so we can treat them separately.
        // Everything left in recipeData can be passed directly to Prisma.
        const { instructions, ingredients, tags, ...recipeData } =
            data as typeof data & Record<string, unknown>;

        const originalRecipe = await prisma.recipe.findUnique({
            where: { id }
        });

        if (!originalRecipe) {
            log.warn('updateOneById – recipe not found', { id });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.RECIPE_NOT_FOUND
            );
        }

        const updatedRecipe = await prisma.$transaction(async (tx) => {
            if (Object.keys(recipeData).length > 0) {
                await tx.recipe.update({ where: { id }, data: recipeData });
            }

            if (instructions !== undefined) {
                await tx.instruction.deleteMany({
                    where: { recipeId: id }
                });

                if (instructions.length > 0) {
                    await tx.instruction.createMany({
                        data: instructions.map(
                            (text: string, index: number) => ({
                                recipeId: id,
                                step: index + 1,
                                text
                            })
                        )
                    });
                }
            }

            if (ingredients !== undefined) {
                await tx.recipeIngredient.deleteMany({
                    where: { recipeId: id }
                });

                // Calculate orders
                const categoryOrders =
                    this.calculateCategoryOrders(ingredients);
                const ingredientOrders =
                    this.calculateIngredientOrders(ingredients);

                for (let i = 0; i < ingredients.length; i++) {
                    const ingredientData = ingredients[i];

                    const categoryOrder = categoryOrders[i];
                    const ingredientOrder = ingredientOrders[i];

                    if (!ingredientData || ingredientOrder === undefined) {
                        continue;
                    }

                    let ingredient = await tx.ingredient.findUnique({
                        where: { name: ingredientData.name }
                    });

                    if (!ingredient) {
                        ingredient = await tx.ingredient.create({
                            data: { name: ingredientData.name }
                        });
                    }

                    await tx.recipeIngredient.create({
                        data: {
                            recipeId: id,
                            ingredientId: ingredient.id,
                            quantity: ingredientData.quantity,
                            category: ingredientData.category || null,
                            categoryOrder,
                            ingredientOrder
                        }
                    });
                }
            }

            if (tags !== undefined) {
                await tx.recipeTag.deleteMany({ where: { recipeId: id } });

                if (tags.length > 0) {
                    await tx.recipeTag.createMany({
                        data: tags.map((tag) => ({
                            recipeId: id,
                            tagId: tag.id
                        }))
                    });
                }
            }

            return (await tx.recipe.findUnique({
                where: { id },
                include: {
                    ingredients: {
                        include: { ingredient: true },
                        orderBy: { ingredientOrder: 'asc' }
                    },
                    instructions: true
                }
            })) as Recipe;
        });

        await invalidateTags([
            CACHE_TAGS.recipe.entity(id),
            CACHE_TAGS.recipe.byDisplayId(originalRecipe.displayId),
            CACHE_TAGS.recipe.ownedBy(originalRecipe.authorId)
        ]);

        return updatedRecipe;
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
     * Delete a recipe by id
     *
     * Write class -> W1
     */
    async deleteOneById(id: number): Promise<void> {
        log.trace('Deleting recipe by id', { id });

        // Capture the identity needed for targeted invalidation before the row
        // is gone: the two single-recipe lookups plus the author's collections.
        // Global lists are C1 (60s ttl) and left to expire — a deleted recipe
        // can only linger there briefly, and its detail page is cleared here.
        const identity = await prisma.recipe.findUnique({
            where: { id },
            select: { displayId: true, authorId: true }
        });

        // Use a transaction to ensure that all dependent records are removed
        // before the actual recipe is deleted, foreign key constraints will fail otherwise.
        await prisma.$transaction(async (tx) => {
            // Appeals reference recipeFlag with ON DELETE RESTRICT, so they
            // must be cleared before the flag rows themselves can be removed.
            await tx.recipeFlagAppeal.deleteMany({
                where: { flag: { recipeId: id } }
            });

            await Promise.all([
                tx.instruction.deleteMany({ where: { recipeId: id } }),
                tx.recipeIngredient.deleteMany({ where: { recipeId: id } }),
                tx.shoppingListIngredient.deleteMany({
                    where: { recipeId: id }
                }),
                tx.rating.deleteMany({ where: { recipeId: id } }),
                tx.userVisitedRecipe.deleteMany({ where: { recipeId: id } }),
                tx.recipeTag.deleteMany({ where: { recipeId: id } }),
                tx.recipeFlag.deleteMany({ where: { recipeId: id } })
            ]);

            await tx.recipe.delete({ where: { id } });
        });

        await invalidateTags([
            CACHE_TAGS.recipe.entity(id),
            ...(identity
                ? [
                      CACHE_TAGS.recipe.byDisplayId(identity.displayId),
                      CACHE_TAGS.recipe.ownedBy(identity.authorId)
                  ]
                : [])
        ]);
    }

    //~=========================================================================================~//
    //$                                      PRIVATE METHODS                                    $//
    //~=========================================================================================~//

    /**
     * Re-instantiates the recipe's Date fields after a cache round-trip.
     *
     * NOT a no-op, despite the types claiming otherwise: cachePrismaQuery serializes
     * results to JSON in redis, so on a cache hit these come back as strings,
     * not Date instances. Callers that do recipe.createdAt.toISOString() would
     * throw on those hits without this. Do NOT remove it.
     */
    private reviveRecipeDates(
        recipe: getRecipeById.Result | null
    ): getRecipeById.Result | null {
        if (!recipe) return null;

        return {
            ...recipe,
            createdAt: new Date(recipe.createdAt),
            updatedAt: new Date(recipe.updatedAt)
        };
    }

    /**
     * Calculate categoryOrder for each ingredient based on category appearance order.
     * Uncategorized ingredients get categoryOrder = null
     */
    private calculateCategoryOrders(
        ingredients: { category?: string | null }[]
    ): (number | null)[] {
        const categoryMap = new Map<string, number>();
        let nextOrder = 1;

        return ingredients.map((ing) => {
            if (!ing.category) return null;

            if (!categoryMap.has(ing.category)) {
                categoryMap.set(ing.category, nextOrder++);
            }

            return categoryMap.get(ing.category)!;
        });
    }

    private calculateIngredientOrders(
        ingredients: { category?: string | null }[]
    ): number[] {
        const categoryCounters = new Map<string | null, number>();

        return ingredients.map((ing) => {
            const category = ing.category || null;

            const currentOrder = categoryCounters.get(category) || 0;
            const nextOrder = currentOrder + 1;

            categoryCounters.set(category, nextOrder);

            return nextOrder;
        });
    }
}

const recipeModel = new RecipeModel();
export default recipeModel;
