import db from '@/server/db/model';
import { Logger, LogServiceMethod } from '@/server/logger';
import type { RecipeTagDTO } from '@/common/types';

//|=============================================================================================|//

const LOG_CONTEXT = 'recipe-tag-service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const log = Logger.getInstance(LOG_CONTEXT);

/**
 * Provides read access to the recipe tag catalogue.
 */
class RecipeTagService {
    static readonly LOG_CONTEXT = LOG_CONTEXT;

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

    /**
     * Returns a single tag by its unique slug, or null when it does not exist.
     *
     * @param slug - The tag's database slug.
     * @param language - Locale to translate the tag name into.
     */
    @LogServiceMethod({ names: ['slug', 'language'] })
    async getBySlug(
        slug: string,
        language: string
    ): Promise<RecipeTagDTO | null> {
        return db.recipeTag.getBySlug(slug, language);
    }
}

export const recipeTagService = new RecipeTagService();
