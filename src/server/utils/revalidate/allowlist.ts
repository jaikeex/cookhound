import {
    ROUTES,
    RECIPE_DISPLAY_ID_REGEX,
    RECIPE_TITLE_SLUG_REGEX,
    RECIPE_TITLE_SLUG_MAX_LENGTH
} from '@/common/constants';

const RECIPE_DETAIL_PREFIX = ROUTES.recipe.detail('');

/**
 * Decides whether api/revalidate may revalidate the given path.
 *
 * Only recipe detail paths are allowed, in either shape:
 * - /recept/<displayId>
 * - /recept/<displayId>/<titleSlug>
 */
export const isRevalidatablePath = (path: string): boolean => {
    if (!path.startsWith(RECIPE_DETAIL_PREFIX)) {
        return false;
    }

    const segments = path.slice(RECIPE_DETAIL_PREFIX.length).split('/');
    const [displayId, titleSlug] = segments;

    if (segments.length > 2 || !displayId) {
        return false;
    }

    if (!RECIPE_DISPLAY_ID_REGEX.test(displayId)) {
        return false;
    }

    if (segments.length === 1) {
        return true;
    }

    if (!titleSlug) {
        return false;
    }

    return (
        titleSlug.length <= RECIPE_TITLE_SLUG_MAX_LENGTH &&
        titleSlug !== 'edit' &&
        RECIPE_TITLE_SLUG_REGEX.test(titleSlug)
    );
};
