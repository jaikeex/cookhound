import type { IngredientDTO } from '@/common/types';
import db from '@/server/db/model';
import { Logger, LogServiceMethod } from '@/server/logger';

//|=============================================================================================|//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = Logger.getInstance('ingredient-service');

class IngredientService {
    /**
     * Get all ingredients for a language, sorted alphabetically.
     */
    @LogServiceMethod({ names: ['language'] })
    async getAll(language: string): Promise<IngredientDTO[]> {
        return db.ingredient.getManyByLanguage(language);
    }
}

export const ingredientService = new IngredientService();
