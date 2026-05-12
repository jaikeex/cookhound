import type { Locale } from '@/common/types';
import { useAppQuery } from '@/client/request/queryClient/queryFactories';
import { useRepositories } from '@/client/data';
import { INGREDIENT_QUERY_KEYS, type IngredientListOptions } from './keys';

export const ingredientQueryClient = {
    /**
     * Gets full ingredient list for the given locale.
     */
    useIngredients: (
        language: Locale,
        options?: Partial<IngredientListOptions>
    ) => {
        const { ingredientRepository } = useRepositories();

        return useAppQuery(
            INGREDIENT_QUERY_KEYS.list(language),
            ({ signal }) => ingredientRepository.list({ language, signal }),
            {
                enabled: Boolean(language),
                staleTime: 6 * 60 * 60 * 1000, // 6 hours
                retry: 1,
                ...options
            }
        );
    }
};
