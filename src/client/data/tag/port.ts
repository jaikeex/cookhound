import type { Locale, Recipe, RecipeTagDTO, TagListDTO } from '@/common/types';

/**
 * Domain port for tag data access.
 */
export interface TagRepository {
    /**
     * Returns the full list of tag categories (and their tags) for the given
     * locale.
     */
    list(args: {
        language: Locale;
        signal?: AbortSignal;
    }): Promise<TagListDTO[]>;

    /**
     * Asks the backend for AI-generated tag suggestions for a recipe.
     */
    suggest(recipe: Recipe): Promise<RecipeTagDTO[]>;
}
