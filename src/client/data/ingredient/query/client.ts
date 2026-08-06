import { useAppQuery } from '@/client/data/queryFactories';
import { useRepositories } from '@/client/data/DataProvider';
import { INGREDIENT_QUERY_KEYS, type IngredientListOptions } from './keys';

export const ingredientQueryClient = {
    /**
     * Gets the full ingredient list.
     */
    useIngredients: (options?: Partial<IngredientListOptions>) => {
        const { ingredientRepository } = useRepositories();

        return useAppQuery(
            INGREDIENT_QUERY_KEYS.list(),
            ({ signal }) => ingredientRepository.list({ signal }),
            {
                staleTime: 6 * 60 * 60 * 1000, // 6 hours
                retry: 1,
                ...options
            }
        );
    }
};
