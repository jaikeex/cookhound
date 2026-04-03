import db from '@/server/db/model';
import { Logger, LogServiceMethod } from '@/server/logger';

//|=============================================================================================|//

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = Logger.getInstance('recipe-tag-service');

/**
 * Provides read access to the recipe tag catalogue.
 */
class RecipeTagService {
    /**
     * Returns all recipe tags for a given locale.
     *
     * @param language - Locale to filter tags by.
     * @returns All available recipe tags for the locale.
     */
    @LogServiceMethod({ names: ['language'] })
    async getAll(language: string) {
        const tags = await db.recipeTag.getAll(language);

        return tags;
    }
}

export const recipeTagService = new RecipeTagService();
