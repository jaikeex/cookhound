import { RECIPE_TITLE_SLUG_MAX_LENGTH } from '@/common/constants/recipe';

/**
 * Derives the url title slug for a recipe title: diacritics stripped, lowercased,
 * non-alphanumeric runs collapsed to single dashes, trimmed, and capped characters.
 *
 * An empty result is a valid outcome, the canonical url is then the
 * bare path, so callers must not assume a non-empty title slug.
 */
export function slugifyRecipeTitle(title: string): string {
    const titleSlug = title
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, RECIPE_TITLE_SLUG_MAX_LENGTH)
        .replace(/-+$/g, '');

    return titleSlug === 'edit' ? 'edit-recept' : titleSlug;
}
