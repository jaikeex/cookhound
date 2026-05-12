'use client';

import { ingredientApiClient } from '@/client/request/apiClient/ingredient';
import type { IngredientRepository } from '@/client/data/ingredient/port';

/**
 * HTTP-backed implementation of {@link IngredientRepository}.
 */
export const httpIngredientRepository: IngredientRepository = {
    list: ({ language, signal }) =>
        ingredientApiClient.getIngredients(language, { signal })
};
