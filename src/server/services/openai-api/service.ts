import { Logger } from '@/server/logger';
import type { RecipeDTO } from '@/common/types';
import { queueManager } from '@/server/queues/QueueManager';
import { JOB_NAMES } from '@/server/queues/jobs/names';
import type { RecipeForEvaluation } from './types';

//|=============================================================================================|//

const log = Logger.getInstance('openai-api-service');

class OpenAIApiService {
    async evaluateRecipeContent(recipe: RecipeDTO) {
        log.trace('evaluateRecipeContent - attempt', { id: recipe.id });

        const ingredientsForEvaluation = recipe.ingredients.map((i) => ({
            name: i.name,
            quantity: i.quantity
        }));

        const recipeForEvaluation: RecipeForEvaluation = {
            title: recipe.title,
            language: recipe.language,
            time: recipe.time,
            portionSize: recipe.portionSize,
            ingredients: ingredientsForEvaluation,
            instructions: recipe.instructions,
            notes: recipe.notes
        };

        await queueManager.addJob(JOB_NAMES.EVALUATE_RECIPE, {
            data: recipeForEvaluation,
            userId: recipe.authorId,
            recipeId: recipe.id,
            recipeDisplayId: recipe.displayId
        });

        return;
    }
}

export const openaiApiService = new OpenAIApiService();
