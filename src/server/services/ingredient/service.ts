import type { IngredientDTO, Locale } from '@/common/types';
import db from '@/server/db/model';
import { Logger, LogServiceMethod } from '@/server/logger';

//|=============================================================================================|//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = Logger.getInstance('ingredient-service');

/**
 * Provides read access to the ingredient catalogue.
 */
class IngredientService {
    /**
     * Returns all ingredients for a given locale, sorted alphabetically.
     *
     * @param language - Locale to filter ingredients by.
     * @returns Alphabetically sorted ingredient DTOs.
     */
    @LogServiceMethod({ names: ['language'] })
    async getAll(language: Locale): Promise<IngredientDTO[]> {
        return db.ingredient.getManyByLanguage(language);
    }
}

export const ingredientService = new IngredientService();
