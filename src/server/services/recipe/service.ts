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

        return this.getRecipeById(recipe.id);
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
}

export const recipeService = new RecipeService();
