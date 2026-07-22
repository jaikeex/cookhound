import type { Recipe } from '@/common/types';
import { t } from '@/client/locales';

/**
 * Produce a minimal placeholder recipe used while filling the recipe forms.
 * This ensures preview components always receive a complete object.
 */
export function createRecipePlaceholder(): Recipe {
    return {
        id: 0,
        displayId: '',
        rating: null,
        timesRated: 0,
        timesViewed: 0,
        imageUrl: '/img/recipe-placeholder.webp',
        title: t('app.recipe.title'),
        portionSize: null,
        flags: [],
        tags: [],
        time: null,
        description: null,
        notes: null,
        ingredients: [],
        instructions: [],
        authorId: 0,
        createdAt: new Date(),
        updatedAt: new Date()
    };
}
