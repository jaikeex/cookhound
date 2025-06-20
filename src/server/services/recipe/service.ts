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

class RecipeService {
    //~-----------------------------------------------------------------------------------------~//
    //$                                        GET BY ID                                        $//
    //~-----------------------------------------------------------------------------------------~//

    async getRecipeById(id: number): Promise<RecipeDTO> {
        const recipe = await db.recipe.getOneById(id);

        if (!recipe) {
            throw new ServerError('recipe.error.not-found', 404);
        }

        if (!recipe.id || !recipe.authorId || !recipe.title) {
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

        return recipeDTO;
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         CREATE                                          $//
    //~-----------------------------------------------------------------------------------------~//

    async createRecipe(payload: RecipeForCreatePayload): Promise<RecipeDTO> {
        const author = await authService.getCurrentUser();

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
            authorId: author.id,
            instructions: payload.instructions,
            ingredients: payload.ingredients
        });

        return this.getRecipeById(recipe.id);
    }

    //~-----------------------------------------------------------------------------------------~//
    //$                                         RATING                                          $//
    //~-----------------------------------------------------------------------------------------~//

    async rateRecipe(recipeId: number, rating: number): Promise<void> {
        if (rating < 1 || rating > 5) {
            throw new ServerError('app.error.bad-request', 400);
        }

        const author = await authService.getCurrentUser();

        const recipe = await this.getRecipeById(recipeId);

        if (!recipe) {
            throw new ServerError('recipe.error.not-found', 404);
        }

        const existingRating: Rating | null =
            await db.rating.getOneByUserIdAndRecipeId(author.id, recipeId);

        if (existingRating) {
            await db.rating.updateOne(author.id, recipeId, {
                rating
            });
        } else {
            await db.rating.createOne(author.id, recipeId, {
                rating
            });
        }

        const allRatings = await db.rating.getAllByRecipeId(recipeId);

        const sumOfRatings = allRatings.reduce(
            (acc, rating) => acc + Number(rating.rating),
            0
        );

        const averageRating = sumOfRatings / allRatings.length;

        await db.recipe.updateOneById(recipeId, {
            rating: averageRating
        });
    }
}

export const recipeService = new RecipeService();
