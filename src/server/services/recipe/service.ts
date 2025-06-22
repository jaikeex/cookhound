import type {
    Ingredient,
    RecipeDTO,
    RecipeForCreatePayload
} from '@/common/types';
import type { RecipeForCreate } from './types';
import { authService } from '@/server/services/';
import db from '@/server/db/model';
import type { Locale } from '@/client/locales';
import { ServerError } from '@/server/error';
import type { Rating } from '@prisma/client';
import { Logger } from '@/server/logger';
import { RequestContext } from '@/server/utils/reqwest/context';

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

        if (!recipe.id || !recipe.authorId || !recipe.title) {
            log.warn('getRecipeById - recipe missing required fields', { id });
            throw new ServerError('recipe.error.not-found', 404);
        }

        const recipeDTO: RecipeDTO = {
            id: recipe.id,
            title: recipe.title,
            authorId: recipe.authorId,
            language: recipe.language as Locale,
            time: recipe.time,
            difficulty: recipe.difficulty || 'easy',
            portionSize: recipe.portionSize,
            notes: recipe.notes,
            imageUrl: recipe.imageUrl || '',
            rating: recipe.rating ? Number(recipe.rating) : null,
            ingredients: recipe.ingredients as Ingredient[],
            instructions: recipe.instructions as string[]
        };

        log.trace('getRecipeById - success', { id });

        return recipeDTO;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         CREATE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    async createRecipe(payload: RecipeForCreatePayload): Promise<RecipeDTO> {
        log.trace('createRecipe - attempt', { payload });

        let authorId = RequestContext.getUserId();

        if (!authorId) {
            log.warn('createRecipe - user not set in request context');
            authorId = (await authService.getCurrentUser()).id;
        }

        const recipeforCreate: RecipeForCreate = {
            title: payload.title,
            language: payload.language,
            notes: payload.notes,
            time: payload.time,
            difficulty: payload.difficulty,
            portionSize: payload.portionSize,
            imageUrl: payload.imageUrl
        };

        const recipe = await db.recipe.createOne({
            recipe: recipeforCreate,
            authorId: authorId,
            instructions: payload.instructions,
            ingredients: payload.ingredients
        });

        log.notice('createRecipe - success', { payload });

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

        let authorId = RequestContext.getUserId();

        if (!authorId) {
            log.warn('createRecipe - user not set in request context');
            authorId = (await authService.getCurrentUser()).id;
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
            rating: averageRating
        });

        log.trace('rateRecipe - success', { recipeId, rating });
    }
}

export const recipeService = new RecipeService();
