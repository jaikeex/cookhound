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
     * Returns all recipe tags.
     *
     * @returns All available recipe tags.
     */
    @LogServiceMethod({ names: [] })
    async getAll() {
        const tags = await db.recipeTag.getAll();

        return tags;
    }

    /**
     * Returns a single tag by its unique slug, or null when it does not exist.
     *
     * @param slug - The tag's database slug.
     */
    @LogServiceMethod({ names: ['slug'] })
    async getBySlug(slug: string): Promise<RecipeTagDTO | null> {
        return db.recipeTag.getBySlug(slug);
    }

    /**
     * Returns the tags carrying at least threshold non-flagged recipes, with
     * that count and the newest recipe update among them.
     */
    @LogServiceMethod({ names: ['threshold'] })
    async listIndexableHubs(
        threshold: number
    ): Promise<
        Array<{ slug: string; recipeCount: number; lastModified: Date }>
    > {
        return db.recipeTag.getIndexableHubs(threshold);
    }
}

export const recipeTagService = new RecipeTagService();
