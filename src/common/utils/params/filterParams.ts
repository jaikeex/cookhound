import type { RecipeFilterParams } from '@/common/types';

const PARAM_KEYS = {
    containsIngredients: 'ci',
    excludesIngredients: 'ei',
    timeMin: 'tmin',
    timeMax: 'tmax',
    tags: 'tag',
    hasImage: 'img'
} as const;

/**
 * Serialize a RecipeFilterParams object into a URLSearchParams instance.
 *
 * @param filters - The filter state to serialize.
 */
export const serializeFilterParams = (
    filters: RecipeFilterParams
): URLSearchParams => {
    const params = new URLSearchParams();

    const {
        containsIngredients,
        excludesIngredients,
        timeMin,
        timeMax,
        tags,
        hasImage
    } = filters;

    containsIngredients?.forEach((id) =>
        params.append(PARAM_KEYS.containsIngredients, String(id))
    );

    excludesIngredients?.forEach((id) =>
        params.append(PARAM_KEYS.excludesIngredients, String(id))
    );

    if (timeMin !== undefined) {
        params.set(PARAM_KEYS.timeMin, String(timeMin));
    }

    if (timeMax !== undefined) {
        params.set(PARAM_KEYS.timeMax, String(timeMax));
    }

    tags?.forEach((id) => params.append(PARAM_KEYS.tags, String(id)));

    if (hasImage !== undefined) {
        params.set(PARAM_KEYS.hasImage, String(hasImage));
    }

    return params;
};

/**
 * Parses URLSearchParams back into RecipeFilterParams object.
 *
 * @param params - The URL search params to parse.
 */
export const deserializeFilterParams = (
    params: URLSearchParams
): RecipeFilterParams => {
    const filters: RecipeFilterParams = {};

    const parseIds = (key: string): number[] =>
        params
            .getAll(key)
            .map(Number)
            .filter((n) => !isNaN(n) && n > 0);

    const ci = parseIds(PARAM_KEYS.containsIngredients);
    if (ci.length > 0) filters.containsIngredients = ci;

    const ei = parseIds(PARAM_KEYS.excludesIngredients);
    if (ei.length > 0) filters.excludesIngredients = ei;

    const tminRaw = params.get(PARAM_KEYS.timeMin);

    if (tminRaw !== null) {
        const tmin = Number(tminRaw);
        if (!isNaN(tmin)) filters.timeMin = tmin;
    }

    const tmaxRaw = params.get(PARAM_KEYS.timeMax);

    if (tmaxRaw !== null) {
        const tmax = Number(tmaxRaw);
        if (!isNaN(tmax)) filters.timeMax = tmax;
    }

    if (filters.timeMin !== undefined && filters.timeMax !== undefined) {
        if (filters.timeMin > filters.timeMax) {
            delete filters.timeMin;
            delete filters.timeMax;
        }
    }

    const tag = parseIds(PARAM_KEYS.tags);
    if (tag.length > 0) filters.tags = tag;

    const imgRaw = params.get(PARAM_KEYS.hasImage);
    if (imgRaw === 'true') filters.hasImage = true;

    return filters;
};
