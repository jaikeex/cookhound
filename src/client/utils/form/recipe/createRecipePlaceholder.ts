import type { Locale } from '@/common/types';
import type { RecipeDTO } from '@/common/types';

/**
 * Produce a minimal placeholder recipe used while filling the recipe forms.
 * This ensures preview components always receive a complete object.
 */
export function createRecipePlaceholder(
    language: Locale,
    t: (key: string) => string
): RecipeDTO {
    return {
        id: 0,
        displayId: '',
        rating: null,
        timesRated: 0,
        timesViewed: 0,
        language,
        imageUrl: '/img/recipe-placeholder.webp',
        title: t('app.recipe.title'),
        portionSize: null,
        flags: [],
        tags: [],
        time: null,
        notes: null,
        ingredients: [],
        instructions: [],
        authorId: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    } as RecipeDTO;
}
