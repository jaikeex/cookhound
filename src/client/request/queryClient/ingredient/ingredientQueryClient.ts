import type { Locale } from '@/common/types';
import { useAppQuery } from '@/client/request/queryClient/queryFactories';
import apiClient from '@/client/request/apiClient';
import { INGREDIENT_QUERY_KEYS, type IngredientListOptions } from './types';

// This is fine (not a component, just declarations here).
/* eslint-disable react-hooks/rules-of-hooks */

class IngredientQueryClient {
    /**
     * Gets full ingredient list.
     *
     * @param language - The locale to fetch ingredients for.
     */
    useIngredients = (
        language: Locale,
        options?: Partial<IngredientListOptions>
    ) =>
        useAppQuery(
            INGREDIENT_QUERY_KEYS.list(language),
            () => apiClient.ingredient.getIngredients(language),
            {
                enabled: Boolean(language),
                staleTime: 6 * 60 * 60 * 1000, // 6 hours
                retry: 1,
                ...options
            }
        );
}

export const ingredientQueryClient = new IngredientQueryClient();
