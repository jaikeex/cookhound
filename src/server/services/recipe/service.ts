import type {
    Ingredient,
    RecipeDTO,
    RecipeForCreatePayload,
    RecipeForDisplayDTO
} from '@/common/types';
import type { RecipeForCreate } from './types';
import db from '@/server/db/model';
import type { Locale } from '@/client/locales';
import { ServerError } from '@/server/error';
import type { Rating } from '@prisma/client';
import { Logger } from '@/server/logger';
import { RequestContext } from '@/server/utils/reqwest/context';
import { randomUUID } from 'crypto';
import { recipeSearchIndex } from '@/server/search-index';
import { intersectArrays } from '@/common/utils';
import { SEARCH_QUERY_SEPARATOR } from '@/common/constants';

//|=============================================================================================|//

const log = Logger.getInstance('recipe-service');

class RecipeService {
    //~-----------------------------------------------------------------------------------------~//
    //$                                        GET BY ID                                        $//
    //~-----------------------------------------------------------------------------------------~//

    async getRecipeById(id: number): Promise<RecipeDTO> {
        log.trace('getRecipeById - attempt', { id });

        const recipe = await db.recipe.getOneById(id);

        if (!recipe) {
            log.info('getRecipeById - recipe not found', { id });
            throw new ServerError('recipe.error.not-found', 404);
        }

        if (
            !recipe.id ||
            !recipe.authorId ||
            !recipe.title ||
            !recipe.displayId
        ) {
            log.warn('getRecipeById - recipe missing required fields', { id });
            throw new ServerError('recipe.error.not-found', 404);
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
            timesRated: recipe.timesRated ?? 0,
            timesViewed: recipe.timesViewed ?? 0,
            ingredients: recipe.ingredients as Ingredient[],
            instructions: recipe.instructions as string[]
        };

        log.trace('getRecipeById - success', { id });

        return recipeDTO;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                    GET BY DISPLAY ID                                    $//
    //~-----------------------------------------------------------------------------------------~//

    async getRecipeByDisplayId(displayId: string): Promise<RecipeDTO> {
        log.trace('getRecipeByDisplayId - attempt', { displayId });

        const recipe = await db.recipe.getOneByDisplayId(displayId);

        if (!recipe) {
            log.info('getRecipeByDisplayId - recipe not found', { displayId });
            throw new ServerError('recipe.error.not-found', 404);
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
            throw new ServerError('recipe.error.not-found', 404);
        }

        log.trace('getRecipeByDisplayId - success', { displayId });

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
            timesRated: recipe.timesRated ?? 0,
            timesViewed: (recipe.timesViewed ?? 0) + 1, // Include the increment we just made
            ingredients: recipe.ingredients as Ingredient[],
            instructions: recipe.instructions as string[]
        };

        return recipeDTO;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         CREATE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    async createRecipe(payload: RecipeForCreatePayload): Promise<RecipeDTO> {
        log.trace('createRecipe - attempt', { payload });

        const authorId = RequestContext.getUserId();

        if (!authorId) {
            log.warn('createRecipe - anonymous call');
            throw new ServerError('auth.error.unauthorized', 401);
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
            ingredients: payload.ingredients
        });

        log.notice('createRecipe - success', { recipe });

        const recipeDTO = await this.getRecipeById(recipe.id);

        // Index the recipe.
        try {
            await recipeSearchIndex.upsert(recipeDTO);
        } catch (err) {
            // This is an error that needs to be raised and adressed, Failing to keep the search
            // index up to date could lead to shitty user experience.
            // Do NOT throw however – the user should still get a response even if search indexing fails.
            log.error('createRecipe - failed to index recipe in Typesense', {
                err,
                recipeId: recipe.id
            });
        }

        return recipeDTO;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                      REGISTER VISIT                                     $//
    //~-----------------------------------------------------------------------------------------~//

    async registerRecipeVisit(recipeId: number, userId: number | null) {
        try {
            log.trace('registerRecipeVisit - attempt', { recipeId, userId });

            if (!recipeId) {
                log.warn('registerRecipeVisit - recipeId is required');
                throw new ServerError('app.error.bad-request', 400);
            }

            await db.recipe.incrementViewCount(recipeId);

            /**
             * The code below depends on the userId being present, if it is not, terminate the request.
             */
            if (!userId) {
                log.warn('registerRecipeVisit - anonymous call');
                throw new ServerError('auth.error.unauthorized', 401);
            }

            await db.user.addRecipeToLastViewed(userId, recipeId);

            log.trace('registerRecipeVisit - success', { recipeId, userId });
        } catch (err) {
            /**
             * Explicitly swallow everything here, registering a visit can NEVER
             * break any request, dedicated or otherwise.
             */
            log.warn('registerRecipeVisit - failed', { err, recipeId, userId });
        }
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         RATING                                          $//
    //~-----------------------------------------------------------------------------------------~//

    async rateRecipe(recipeId: number, rating: number): Promise<void> {
        log.trace('rateRecipe - attempt', { recipeId, rating });

        if (rating < 0 || rating > 5) {
            throw new ServerError('app.error.bad-request', 400);
        }

        const authorId = RequestContext.getUserId();

        if (!authorId) {
            log.warn('rateRecipe - anonymous call');
            throw new ServerError('auth.error.unauthorized', 401);
        }

        const recipe = await this.getRecipeById(recipeId);

        if (!recipe) {
            log.warn('rateRecipe - recipe not found', { recipeId });
            throw new ServerError('recipe.error.not-found', 404);
        }

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

        log.trace('rateRecipe - success', { recipeId, rating });

        // Update in search index, no need to await this.
        try {
            const updatedRecipe = await this.getRecipeById(recipeId);
            await recipeSearchIndex.upsert(updatedRecipe);
        } catch (err) {
            // This is an error that needs to be raised and adressed, Failing to keep the search
            // index up to date could lead to shitty user experience.
            // Do NOT throw however – the user should still get a response even if search indexing fails.
            log.error('rateRecipe - failed to update Typesense index', {
                err,
                recipeId
            });
        }
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                  FRONT PAGE FETCH                                      $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Fetch a paginated set of recipes for the front-page infinite scroll.
     * The method will try to prioritise recent and highly-rated recipes while
     * ensuring that only recipes that have been rated at least a certain
     * amount of times are returned. If there are not enough recipes that meet
     * the strict threshold, it will gradually lower the requirement until the
     * requested batch size is fulfilled or no further loosening is possible.
     *
     * @param batch 1-based index of the batch that is being requested. The
     *              first batch is 1.
     * @param perPage Size of the batch. Defaults to 24.
     */
    async getFrontPageRecipes(
        batch: number,
        perPage: number = 24
    ): Promise<RecipeForDisplayDTO[]> {
        log.trace('getFrontPageRecipes - attempt', { batch, perPage });

        const MAX_BATCHES = 5;

        if (batch < 1 || batch > MAX_BATCHES) {
            log.warn('getFrontPageRecipes - invalid batch requested', {
                batch
            });
            throw new ServerError('app.error.bad-request', 400);
        }

        if (perPage <= 0 || perPage > 100) {
            log.warn('getFrontPageRecipes - invalid perPage requested', {
                perPage
            });
            throw new ServerError('app.error.bad-request', 400);
        }

        const offset = (batch - 1) * perPage;

        // Thresholds for the minimum number of ratings a recipe must have in
        // order to be considered. These thresholds are applied in order until
        // a full batch is obtained or until the last threshold has been used.
        const MIN_TIMES_RATED_THRESHOLDS = [10, 5, 2, 1, 0];

        let results: any[] = [];

        for (const threshold of MIN_TIMES_RATED_THRESHOLDS) {
            results = await db.recipe.getManyForFrontPage(
                perPage,
                offset,
                threshold
            );

            if (results.length === perPage || threshold === 0) {
                break;
            }
        }

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

        log.trace('getFrontPageRecipes - success', {
            batch,
            count: recipes.length
        });

        return recipes;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                 TEXT SEARCH FETCH                                     $//
    //~-----------------------------------------------------------------------------------------~//

    /**
     * Search recipes by a free-text query across title, notes, ingredients and instructions.
     * Results are filtered by language and returned in paginated batches.
     * Supports multi-query search with "|" delimiter - returns recipes that match ALL queries.
     */
    async searchRecipes(
        query: string,
        language: Locale,
        batch: number,
        perPage: number = 24
    ): Promise<RecipeForDisplayDTO[]> {
        log.trace('searchRecipes - attempt', {
            query,
            language,
            batch,
            perPage
        });

        const MAX_BATCHES = 20;

        const cleanQuery = query.trim();

        //|-------------------------------------------------------------------------------------|//
        //?                                       CHECKS                                        ?//
        //|-------------------------------------------------------------------------------------|//

        if (!cleanQuery) {
            log.warn('searchRecipes - empty query');
            throw new ServerError('app.error.bad-request', 400);
        }

        if (cleanQuery.length > 128) {
            log.warn('searchRecipes - query too long');
            throw new ServerError('app.error.bad-request', 400);
        }

        if (batch < 1 || batch > MAX_BATCHES) {
            log.warn('searchRecipes - invalid batch', { batch });
            throw new ServerError('app.error.bad-request', 400);
        }

        if (perPage <= 0 || perPage > 100) {
            log.warn('searchRecipes - invalid perPage', { perPage });
            throw new ServerError('app.error.bad-request', 400);
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
            throw new ServerError('app.error.bad-request', 400);
        }

        //|-------------------------------------------------------------------------------------|//
        //?                             FETCH, INTERSECT AND RETURN                             ?//
        //|-------------------------------------------------------------------------------------|//

        let results: RecipeForDisplayDTO[] = [];

        try {
            if (queryTerms.length === 1) {
                // single query fetch.

                results = await recipeSearchIndex.searchSingleQuery(
                    queryTerms[0],
                    language,
                    // I read in docs that fetching extra is useful for dealing with duplicates.
                    // I dont really know how that helps but here it is...
                    perPage * 2,
                    0
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
        } catch (err) {
            log.warn('searchRecipes - falling back to DB search', { err });

            /**
             * Fallback to db search if typesense fails. Do not bother with multi-searching here,
             * fetching all from db would be costly with longer lists and seems pointless.
             */
            results = await db.recipe.searchManyByText(
                queryTerms[0],
                language,
                perPage,
                offset
            );
        }

        //|-------------------------------------------------------------------------------------|//
        //?                                        RETURN                                       ?//
        //|-------------------------------------------------------------------------------------|//

        // Apply pagination to final results
        const paginatedResults = results.slice(offset, offset + perPage);

        const recipes: RecipeForDisplayDTO[] = paginatedResults.map(
            (recipe) => ({
                id: recipe.id,
                displayId: recipe.displayId,
                title: recipe.title,
                imageUrl: recipe.imageUrl || '',
                rating: recipe.rating ? Number(recipe.rating) : null,
                timesRated: recipe.timesRated ?? 0,
                time: recipe.time,
                portionSize: recipe.portionSize
            })
        );

        log.trace('searchRecipes - success', {
            batch,
            count: recipes.length,
            queryTerms: queryTerms.length > 1 ? queryTerms : undefined
        });

        return recipes;
    }
}

export const recipeService = new RecipeService();
