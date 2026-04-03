import {
    UserRole,
    type Ingredient,
    type RecipeDTO,
    type RecipeForCreatePayload,
    type RecipeForDisplayDTO,
    type RecipeTagDTO
} from '@/common/types';
import type { RecipeForCreate } from './types';
import db from '@/server/db/model';
import type { Locale } from '@/common/types';
import {
    AuthErrorForbidden,
    AuthErrorUnauthorized,
    NotFoundError,
    ValidationError
} from '@/server/error';
import type { Rating } from '@/server/db/generated/prisma/client';
import { Logger, LogServiceMethod } from '@/server/logger';
import { RequestContext } from '@/server/utils/reqwest/context';
import { randomUUID } from 'crypto';
import { recipeSearchIndex } from '@/server/search-index';
import { intersectArrays } from '@/common/utils';
import { revalidateRouteCache } from '@/server/utils/revalidateRouteCache';
import { SEARCH_QUERY_SEPARATOR } from '@/common/constants';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES } from '@/server/queues/jobs/names';
import { ApplicationErrorCode } from '@/server/error/codes';
import { openaiApiService } from '@/server/services/openai-api/service';
import type { RecipeFlagDTO } from '@/common/types/flags/recipe-flag';
import { getFrontPageRecipes } from '@/server/db/generated/prisma/sql';

//|=============================================================================================|//

const log = Logger.getInstance('recipe-service');

/**
 * Manages recipe lifecycle operations including creation, updates, deletion,
 * search, ratings, and front-page listing. Coordinates with the Typesense
 * search index and content evaluation.
 */
class RecipeService {
    //~-----------------------------------------------------------------------------------------~//
    //$                                        GET BY ID                                        $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Retrieves a full recipe by its database ID, including any active content flags.
     *
     * @param id - Database ID of the recipe.
     * @returns The complete recipe DTO with ingredients, instructions, tags, and flags.
     * @throws {NotFoundError} If the recipe does not exist or is missing required fields.
     */
    @LogServiceMethod({ names: ['id'] })
    async getRecipeById(id: number): Promise<RecipeDTO> {
        const recipe = await db.recipe.getOneById(id);

        if (!recipe) {
            log.info('getRecipeById - recipe not found', { id });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.RECIPE_NOT_FOUND
            );
        }

        if (
            !recipe.id ||
            !recipe.authorId ||
            !recipe.title ||
            !recipe.displayId
        ) {
            log.warn('getRecipeById - recipe missing required fields', { id });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.RECIPE_NOT_FOUND
            );
        }

        const recipeDTO: RecipeDTO = {
            id: recipe.id,
            displayId: recipe.displayId,
            title: recipe.title,
            authorId: recipe.authorId,
            language: recipe.language as Locale,
            time: recipe.time,
            portionSize: recipe.portionSize,
            notes: recipe.notes,
            imageUrl: recipe.imageUrl || '',
            rating: recipe.rating ? Number(recipe.rating) : null,
            tags: recipe.tags as RecipeTagDTO[],
            flags: null,
            timesRated: recipe.timesRated ?? 0,
            timesViewed: recipe.timesViewed ?? 0,
            ingredients: recipe.ingredients as Ingredient[],
            instructions: recipe.instructions as string[],
            createdAt: recipe.createdAt,
            updatedAt: recipe.updatedAt
        };

        const flags = recipe.flags as unknown as RecipeFlagDTO[];

        if (flags && Array.isArray(flags)) {
            const activeFlags = flags.filter((flag) => flag.active);

            if (activeFlags.length > 0) {
                log.warn('getRecipeById - requested recipe with active flags', {
                    id
                });

                recipeDTO.flags = activeFlags;
            }
        }

        return recipeDTO;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    GET BY DISPLAY ID                                    $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Retrieves a full recipe by its public-facing display ID.
     *
     * @param displayId - Public UUID used in recipe URLs.
     * @returns The complete recipe DTO with an incremented view count.
     * @throws {NotFoundError} If the recipe does not exist or is missing required fields.
     */
    @LogServiceMethod({ names: ['displayId'] })
    async getRecipeByDisplayId(displayId: string): Promise<RecipeDTO> {
        const recipe = await db.recipe.getOneByDisplayId(displayId);

        if (!recipe) {
            log.info('getRecipeByDisplayId - recipe not found', { displayId });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.RECIPE_NOT_FOUND
            );
        }

        if (
            !recipe.id ||
            !recipe.authorId ||
            !recipe.title ||
            !recipe.displayId
        ) {
            log.warn('getRecipeByDisplayId - recipe missing required fields', {
                displayId
            });
            throw new NotFoundError(
                'app.error.not-found',
                ApplicationErrorCode.RECIPE_NOT_FOUND
            );
        }

        const recipeDTO: RecipeDTO = {
            id: recipe.id,
            displayId: recipe.displayId,
            title: recipe.title,
            authorId: recipe.authorId,
            language: recipe.language as Locale,
            time: recipe.time,
            portionSize: recipe.portionSize,
            notes: recipe.notes,
            imageUrl: recipe.imageUrl || '',
            rating: recipe.rating ? Number(recipe.rating) : null,
            tags: recipe.tags as RecipeTagDTO[],
            timesRated: recipe.timesRated ?? 0,
            timesViewed: recipe.timesViewed ?? 0,
            ingredients: recipe.ingredients as Ingredient[],
            instructions: recipe.instructions as string[],
            flags: null,
            createdAt: recipe.createdAt,
            updatedAt: recipe.updatedAt
        };

        const flags = recipe.flags as unknown as RecipeFlagDTO[];

        if (flags && Array.isArray(flags)) {
            const activeFlags = flags.filter((flag) => flag.active);

            if (activeFlags.length > 0) {
                log.warn(
                    'getRecipeByDisplayId - requested recipe with active flags',
                    {
                        displayId
                    }
                );

                recipeDTO.flags = activeFlags;
            }
        }

        return recipeDTO;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         CREATE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Creates a new recipe authored by the authenticated user.
     * After persistence, triggers an asynchronous content evaluation and
     * indexes the recipe in Typesense.
     *
     * @param payload - Recipe data: title, ingredients, instructions, tags, etc.
     * @returns The fully hydrated recipe DTO.
     * @throws {AuthErrorUnauthorized} If the caller is not authenticated.
     */
    @LogServiceMethod({ success: 'notice', names: ['payload'] })
    async createRecipe(payload: RecipeForCreatePayload): Promise<RecipeDTO> {
        const authorId = RequestContext.getUserId();

        if (!authorId) {
            log.warn('createRecipe - anonymous call');
            throw new AuthErrorUnauthorized();
        }

        const displayId = randomUUID();

        const recipeforCreate: RecipeForCreate = {
            displayId,
            title: payload.title,
            language: payload.language,
            notes: payload.notes,
            time: payload.time,
            portionSize: payload.portionSize,
            imageUrl: payload.imageUrl
        };

        const recipe = await db.recipe.createOne({
            recipe: recipeforCreate,
            authorId: authorId,
            instructions: payload.instructions,
            ingredients: payload.ingredients,
            tags: payload.tags ?? []
        });

        const recipeDTO = await this.getRecipeById(recipe.id);

        /**
         * This is the place to call the evaluation. The recipe is created (so it can be flagged),
         * and the content has passed the deterministic app checks.
         */
        openaiApiService.evaluateRecipeContent(recipeDTO);

        // Index the recipe.
        try {
            await recipeSearchIndex.upsert(recipeDTO);
        } catch (error: unknown) {
            // This is an error that needs to be raised and adressed, Failing to keep the search
            // index up to date could lead to shitty user experience.
            // Do NOT throw however – the user should still get a response even if search indexing fails.
            log.errorWithStack(
                'createRecipe - failed to index recipe in Typesense',
                error,
                {
                    recipeId: recipe.id
                }
            );
        }

        return recipeDTO;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         UPDATE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Partially updates a recipe's fields. Only the author or an admin
     * may perform the update. After persistence, triggers a content
     * re-evaluation and revalidates the recipe's route cache.
     *
     * @param recipeId - Database ID of the recipe to update.
     * @param payload - Fields to update (only provided keys are changed).
     * @returns The updated recipe DTO.
     * @throws {AuthErrorUnauthorized} If the caller is not authenticated.
     * @throws {AuthErrorForbidden} If the caller is neither the author nor an admin.
     * @throws {NotFoundError} If the recipe does not exist.
     */
    @LogServiceMethod({ names: ['recipeId', 'payload'] })
    async updateRecipe(
        recipeId: number,
        payload: Partial<RecipeForCreatePayload>
    ): Promise<RecipeDTO> {
        const currentUserId = RequestContext.getUserId();

        if (!currentUserId) {
            log.warn('updateRecipe - anonymous call');
            throw new AuthErrorUnauthorized();
        }

        const recipe = await this.getRecipeById(recipeId);

        if (
            recipe.authorId !== currentUserId &&
            RequestContext.getUserRole() !== UserRole.Admin
        ) {
            log.warn('updateRecipe - access denied', { recipeId });
            throw new AuthErrorForbidden(
                'app.error.bad-request',
                ApplicationErrorCode.RECIPE_ACCESS_DENIED
            );
        }

        const { instructions, ingredients, tags, ...recipeData } = payload;

        const updateInput = {
            ...recipeData,
            instructions,
            ingredients,
            tags: tags === null ? [] : tags
        } as Parameters<typeof db.recipe.updateOneById>[1];

        await db.recipe.updateOneById(recipeId, updateInput);

        const recipeDTO = await this.getRecipeById(recipeId);

        // The recipe was successfully updated, and needs to be evaluated again.
        openaiApiService.evaluateRecipeContent(recipeDTO);

        try {
            await revalidateRouteCache(`/recipe/${recipeDTO.displayId}`);
        } catch (error: unknown) {
            log.warn('updateRecipe - failed to revalidate recipe route', {
                error,
                recipeId
            });
        }

        return recipeDTO;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         DELETE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Permanently deletes a recipe. Only the author or an admin may delete.
     * Removes the recipe from the database, revalidates the route cache,
     * and removes it from the Typesense search index.
     *
     * @param recipeId - Database ID of the recipe to delete.
     * @throws {AuthErrorUnauthorized} If the caller is not authenticated.
     * @throws {AuthErrorForbidden} If the caller is neither the author nor an admin.
     * @throws {NotFoundError} If the recipe does not exist.
     */
    @LogServiceMethod({ names: ['recipeId'] })
    async deleteRecipe(recipeId: number): Promise<void> {
        const currentUserId = RequestContext.getUserId();

        if (!currentUserId) {
            log.warn('deleteRecipe - anonymous call');
            throw new AuthErrorUnauthorized();
        }

        const recipe = await this.getRecipeById(recipeId);

        if (
            currentUserId !== recipe.authorId &&
            RequestContext.getUserRole() !== UserRole.Admin
        ) {
            log.warn('deleteRecipe - access denied', { recipeId });
            throw new AuthErrorForbidden(
                'app.error.bad-request',
                ApplicationErrorCode.RECIPE_ACCESS_DENIED
            );
        }

        await db.recipe.deleteOneById(recipeId);

        try {
            await revalidateRouteCache(`/recipe/${recipe.displayId}`);
        } catch (error: unknown) {
            log.warn('deleteRecipe - failed to revalidate recipe route', {
                error,
                recipeId
            });
        }

        try {
            await recipeSearchIndex.deleteOne(recipeId);
        } catch (error: unknown) {
            log.warn('deleteRecipe - failed to delete recipe in Typesense', {
                error,
                recipeId
            });
        }
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                      REGISTER VISIT                                     $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Enqueues a background job to record a recipe view. Failures are not propagated.
     *
     * @param recipeId - Database ID of the viewed recipe.
     * @param userId - Database ID of the viewer, or `null` for anonymous visits.
     */
    @LogServiceMethod({ names: ['recipeId', 'userId'] })
    async registerRecipeVisit(
        recipeId: number,
        userId: number | null
    ): Promise<void> {
        try {
            if (!recipeId) {
                log.warn('registerRecipeVisit - recipeId is required');
                throw new ValidationError(
                    undefined,
                    ApplicationErrorCode.VALIDATION_FAILED
                );
            }

            await queueManager.addJob(JOB_NAMES.REGISTER_RECIPE_VISIT, {
                recipeId,
                userId
            });
        } catch (error: unknown) {
            /**
             * Explicitly swallow everything here, registering a visit can NEVER
             * break any request, dedicated or otherwise.
             */
            log.warn('registerRecipeVisit - failed to queue', {
                error,
                recipeId,
                userId
            });
        }
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         RATING                                          $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Submits or updates a rating for a recipe by the authenticated user.
     * Recalculates the recipe's average rating, revalidates the route cache,
     * and updates the Typesense search index.
     *
     * @param recipeId - Database ID of the recipe to rate.
     * @param rating - Rating value (0–5 inclusive).
     * @throws {ValidationError} If the rating is out of the 0–5 range.
     * @throws {AuthErrorUnauthorized} If the caller is not authenticated.
     * @throws {NotFoundError} If the recipe does not exist.
     */
    @LogServiceMethod({ names: ['recipeId', 'rating'] })
    async rateRecipe(recipeId: number, rating: number): Promise<void> {
        if (rating < 0 || rating > 5) {
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        const authorId = RequestContext.getUserId();

        if (!authorId) {
            log.warn('rateRecipe - anonymous call');
            throw new AuthErrorUnauthorized();
        }

        const recipe = await this.getRecipeById(recipeId);

        const existingRating: Rating | null =
            await db.rating.getOneByUserIdAndRecipeId(authorId, recipeId);

        log.trace('rateRecipe - existing rating', { existingRating });

        if (existingRating) {
            await db.rating.updateOne(authorId, recipeId, {
                rating
            });
        } else {
            await db.rating.createOne(authorId, recipeId, {
                rating
            });
        }

        const allRatings = await db.rating.getAllByRecipeId(recipeId);

        const sumOfRatings = allRatings.reduce(
            (acc, rating) => acc + Number(rating.rating),
            0
        );

        const averageRating = sumOfRatings / allRatings.length;

        log.trace('rateRecipe - new average rating', { averageRating });

        await db.recipe.updateOneById(recipeId, {
            rating: averageRating,
            timesRated: allRatings.length
        });

        // no need to await this here
        revalidateRouteCache(`/recipe/${recipe.displayId}`);

        try {
            const updatedRecipe = await this.getRecipeById(recipeId);
            await recipeSearchIndex.upsert(updatedRecipe);
        } catch (error: unknown) {
            // This is an error that needs to be raised and adressed, Failing to keep the search
            // index up to date could lead to shitty user experience.
            // Do NOT throw however – the user should still get a response even if search indexing fails.
            log.errorWithStack(
                'rateRecipe - failed to update Typesense index',
                error,
                {
                    recipeId
                }
            );
        }
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                  FRONT PAGE FETCH                                      $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Fetches a paginated batch of recipes for the front-page infinite scroll.
     * Prioritises highly-rated recipes, progressively lowering the minimum
     * rating-count threshold until the batch is filled or no further
     * loosening is possible. Flagged recipes are excluded.
     *
     * @param language - Locale to filter recipes by.
     * @param batch - 1-based batch index (max 5).
     * @param perPage - Batch size (max 100, defaults to 24).
     * @returns Display-ready recipe DTOs for the requested page.
     */
    @LogServiceMethod({ names: ['language', 'batch', 'perPage'] })
    async getFrontPageRecipes(
        language: Locale,
        batch: number,
        perPage: number = 24
    ): Promise<RecipeForDisplayDTO[]> {
        const MAX_BATCHES = 5;

        if (batch < 1 || batch > MAX_BATCHES) {
            log.warn('getFrontPageRecipes - invalid batch requested', {
                batch
            });
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        if (perPage <= 0 || perPage > 100) {
            log.warn('getFrontPageRecipes - invalid perPage requested', {
                perPage
            });
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        const offset = (batch - 1) * perPage;

        // Thresholds for the minimum number of ratings a recipe must have in
        // order to be considered. These thresholds are applied in order until
        // a full batch is obtained or until the last threshold has been used.
        const MIN_TIMES_RATED_THRESHOLDS = [10, 5, 2, 1, 0];

        let results: getFrontPageRecipes.Result[] = [];

        for (const threshold of MIN_TIMES_RATED_THRESHOLDS) {
            results = await db.recipe.getManyForFrontPage(
                language,
                perPage,
                offset,
                threshold
            );

            if (results.length === perPage || threshold === 0) {
                break;
            }
        }

        /**
         * No flag info needed here because the getManyForFrontPage query guarantees that no flagged recipes
         * are returned to the service.
         */
        const recipes: RecipeForDisplayDTO[] = results.map((recipe) => ({
            id: recipe.id,
            displayId: recipe.displayId,
            title: recipe.title,
            imageUrl: recipe.imageUrl || '',
            rating: recipe.rating ? Number(recipe.rating) : null,
            timesRated: recipe.timesRated ?? 0,
            time: recipe.time,
            portionSize: recipe.portionSize
        }));

        return recipes;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                   TEXT SEARCH FETCH                                     $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Searches recipes by free-text query across title, notes, ingredients,
     * and instructions via Typesense. Supports multi-term queries delimited
     * by "|", results must match ALL terms. Falls back to a
     * database text search if Typesense is unavailable.
     *
     * @param query - Free-text search query (pipe-delimited for multi-term).
     * @param language - Locale to filter recipes by.
     * @param batch - 1-based batch index (max 20).
     * @param perPage - Batch size (max 100, defaults to 24).
     * @returns Display-ready recipe DTOs matching the query.
     */
    @LogServiceMethod({ names: ['query', 'language', 'batch', 'perPage'] })
    async searchRecipes(
        query: string,
        language: Locale,
        batch: number,
        perPage: number = 24
    ): Promise<RecipeForDisplayDTO[]> {
        const MAX_BATCHES = 20;

        const cleanQuery = query.trim();

        //|-------------------------------------------------------------------------------------|//
        //?                                       CHECKS                                        ?//
        //|-------------------------------------------------------------------------------------|//

        if (!cleanQuery) {
            log.warn('searchRecipes - empty query');
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        if (cleanQuery.length > 128) {
            log.warn('searchRecipes - query too long');
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        if (batch < 1 || batch > MAX_BATCHES) {
            log.warn('searchRecipes - invalid batch', { batch });
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        if (perPage <= 0 || perPage > 100) {
            log.warn('searchRecipes - invalid perPage', { perPage });
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        //|-------------------------------------------------------------------------------------|//
        //?                                    PREPARE QUERY                                    ?//
        //|-------------------------------------------------------------------------------------|//

        const offset = (batch - 1) * perPage;

        const queryTerms = cleanQuery
            .split(SEARCH_QUERY_SEPARATOR)
            .map((term) => term.trim())
            .filter((term) => term.length > 0);

        if (queryTerms.length === 0) {
            log.warn('searchRecipes - no valid query terms after parsing');
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        //|-------------------------------------------------------------------------------------|//
        //?                             FETCH, INTERSECT AND RETURN                             ?//
        //|-------------------------------------------------------------------------------------|//

        let results: RecipeForDisplayDTO[] = [];

        try {
            if (queryTerms.length === 1) {
                // single query fetch.

                if (!queryTerms[0]) {
                    throw new ValidationError(
                        undefined,
                        ApplicationErrorCode.VALIDATION_FAILED
                    );
                }

                results = await recipeSearchIndex.searchSingleQuery(
                    queryTerms[0],
                    language,
                    perPage,
                    offset
                );
            } else {
                // multi query fetch.

                log.trace('searchRecipes - multi-query detected', {
                    queryTerms,
                    termCount: queryTerms.length
                });

                //?—————————————————————————————————————————————————————————————————————————————?//
                //?                               IMPORTANT INFO                                ?//
                ///
                //# This logic deals with incoming multiple-part queries (remember, those are the ones
                //# delimited by "|"). The expected behaviour ís that the results will contain
                //# only items hit for both query strings.
                //# This CANNOT be done natively in typesense it seems, and the only effective way
                //# i found that did not involve code right from hell is this. Simply fetch for all
                //# queries and intersect... Easy, simple, no idea how effective.
                ///
                //?—————————————————————————————————————————————————————————————————————————————?//

                // Set generous limits here, the intersection provides much better results.
                const searchLimit = Math.max(perPage * 3, 100);
                const searchPromises = queryTerms.map((term) =>
                    recipeSearchIndex.searchSingleQuery(
                        term,
                        language,
                        searchLimit,
                        0
                    )
                );

                const searchResults = await Promise.all(searchPromises);

                log.trace('searchRecipes - individual results', {
                    resultCounts: searchResults.map((results) => results.length)
                });

                const intersection = intersectArrays(
                    searchResults,
                    (recipe) => recipe.id
                );

                intersection.sort((a, b) => {
                    // First sort by rating (higher first)
                    if (a.rating !== b.rating) {
                        if (a.rating === null) return 1;
                        if (b.rating === null) return -1;
                        return b.rating - a.rating;
                    }
                    return (b.timesRated ?? 0) - (a.timesRated ?? 0);
                });

                results = intersection.slice(offset, offset + perPage);
            }
        } catch (error: unknown) {
            log.warn('searchRecipes - falling back to DB search', { error });

            if (!queryTerms[0]) {
                throw new ValidationError(
                    undefined,
                    ApplicationErrorCode.VALIDATION_FAILED
                );
            }

            /**
             * Fallback to db search if typesense fails. Do not bother with multi-searching here,
             * fetching all from db would be costly with longer lists and seems pointless.
             */
            const dbResults = await db.recipe.searchManyByText(
                queryTerms[0],
                language,
                perPage,
                offset
            );

            /**
             * No flag info needed here because both typesense and the searchManyByText query guarantees
             * that no flagged recipes are returned to the service.
             */
            results = dbResults.map((recipe) => ({
                id: recipe.id,
                displayId: recipe.displayId,
                title: recipe.title,
                imageUrl: recipe.imageUrl || '',
                rating: recipe.rating ? Number(recipe.rating) : null,
                timesRated: recipe.timesRated ?? 0,
                time: recipe.time,
                portionSize: recipe.portionSize
            }));
        }

        return results;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                 USER RECIPES FETCH                                      $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Fetches a paginated list of recipes authored by a specific user.
     * Includes active content flags (visible to the author).
     *
     * @param userId - Database ID of the author.
     * @param language - Locale to filter recipes by.
     * @param batch - 1-based batch index.
     * @param perPage - Batch size (max 100, defaults to 24).
     * @returns Display-ready recipe DTOs with flag information, or an empty array.
     */
    @LogServiceMethod({ names: ['userId', 'language', 'batch', 'perPage'] })
    async getUserRecipes(
        userId: number,
        language: Locale,
        batch: number,
        perPage: number = 24
    ): Promise<RecipeForDisplayDTO[]> {
        if (perPage <= 0 || perPage > 100) {
            log.warn('getFrontPageRecipes - invalid perPage requested', {
                perPage
            });
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        const offset = (batch - 1) * perPage;

        const recipes = await db.recipe.getManyForUser(
            userId,
            language,
            perPage,
            offset
        );

        if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
            log.info('getUserRecipes - no recipes found');
            return [];
        }

        const results = recipes.map((recipe) => ({
            id: recipe.id ?? 0,
            displayId: recipe.displayId ?? '',
            title: recipe.title ?? '',
            imageUrl: recipe.imageUrl || '',
            rating: recipe.rating ? Number(recipe.rating) : null,
            timesRated: recipe.timesRated ?? 0,
            time: recipe.time ?? 0,
            portionSize: recipe.portionSize,
            flags: recipe.flags as RecipeFlagDTO[] | null
        }));

        return results;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                   USER RECIPES SEARCH                                   $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Searches a user's own recipes by free-text query against the database.
     * Includes active content flags in the results.
     *
     * @param userId - Database ID of the author whose recipes to search.
     * @param query - Free-text search string.
     * @param language - Locale to filter recipes by.
     * @param batch - 1-based batch index.
     * @param perPage - Batch size (max 100, defaults to 24).
     * @returns Display-ready recipe DTOs matching the query, or an empty array.
     */
    @LogServiceMethod({
        names: ['userId', 'query', 'language', 'batch', 'perPage']
    })
    async searchUserRecipes(
        userId: number,
        query: string,
        language: Locale,
        batch: number,
        perPage: number = 24
    ): Promise<RecipeForDisplayDTO[]> {
        if (perPage <= 0 || perPage > 100) {
            log.warn('searchUserRecipes - invalid perPage requested', {
                perPage
            });
            throw new ValidationError(
                undefined,
                ApplicationErrorCode.VALIDATION_FAILED
            );
        }

        const offset = (batch - 1) * perPage;

        const recipes = await db.recipe.searchManyByTextForUser(
            userId,
            query,
            language,
            perPage,
            offset
        );

        if (!recipes || !Array.isArray(recipes) || recipes.length === 0) {
            log.info('searchUserRecipes - no recipes found');
            return [];
        }

        const results = recipes.map((recipe) => ({
            id: recipe.id ?? 0,
            displayId: recipe.displayId ?? '',
            title: recipe.title ?? '',
            imageUrl: recipe.imageUrl || '',
            rating: recipe.rating ? Number(recipe.rating) : null,
            timesRated: recipe.timesRated ?? 0,
            time: recipe.time ?? 0,
            portionSize: recipe.portionSize,
            flags: recipe.flags as RecipeFlagDTO[] | null
        }));

        return results;
    }
}

export const recipeService = new RecipeService();
