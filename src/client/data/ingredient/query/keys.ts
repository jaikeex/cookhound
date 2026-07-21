import type { UseQueryOptions } from '@tanstack/react-query';
import type { IngredientDTO } from '@/common/types';
import type { RequestError } from '@/client/error';

//~---------------------------------------------------------------------------------------------~//
//$                                            KEYS                                             $//
//~---------------------------------------------------------------------------------------------~//

const INGREDIENT_NAMESPACE_QUERY_KEY = 'ingredient';

export const INGREDIENT_QUERY_KEYS = Object.freeze({
    namespace: INGREDIENT_NAMESPACE_QUERY_KEY,
    list: () => [INGREDIENT_NAMESPACE_QUERY_KEY, 'list'] as const
});

//~---------------------------------------------------------------------------------------------~//
//$                                          TYPES                                              $//
//~---------------------------------------------------------------------------------------------~//

export type IngredientListOptions = Omit<
    UseQueryOptions<
        IngredientDTO[],
        RequestError,
        IngredientDTO[],
        ReturnType<typeof INGREDIENT_QUERY_KEYS.list>
    >,
    'queryKey' | 'queryFn'
>;
