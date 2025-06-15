import type {
    Ingredient,
    RecipeDTO,
    RecipeForCreatePayload
} from '@/common/types';
import type { RecipeForCreate } from './types';
import { authService } from '@/server/services/';
import db from '@/server/db/model';
import type { Locale } from '@/client/locales';

class RecipeService {
    async getRecipeById(id: number): Promise<RecipeDTO> {
        const recipe = await db.recipe.getOneById(id);

        if (!recipe) {
            throw new Error('Recipe not found');
        }

        if (!recipe.id || !recipe.authorId || !recipe.title) {
            throw new Error('Recipe not found');
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
            recipe: {
                ...recipeforCreate,
                author: {
                    connect: {
                        id: author.id
                    }
                }
            },
            instructions: payload.instructions,
            ingredients: payload.ingredients
        });

        return this.getRecipeById(recipe.id);
    }
}

export const recipeService = new RecipeService();
