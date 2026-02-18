import type { UseQueryOptions } from '@tanstack/react-query';
import type { RequestError } from '@/client/error';
import type { IngredientDTO } from '@/common/types';
import type { Locale } from '@/common/types';

//~---------------------------------------------------------------------------------------------~//
//$                                            KEYS                                             $//
//~---------------------------------------------------------------------------------------------~//

const INGREDIENT_NAMESPACE_QUERY_KEY = 'ingredient';

export const INGREDIENT_QUERY_KEYS = Object.freeze({
    list: (language: Locale) =>
        [INGREDIENT_NAMESPACE_QUERY_KEY, 'list', language] as const
});

//~---------------------------------------------------------------------------------------------~//
//$                                         TYPES                                              $//
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
