import type {
    UseMutationOptions,
    UseQueryOptions
} from '@tanstack/react-query';
import type { Recipe, RecipeTagDTO, TagListDTO } from '@/common/types';
import type { RequestError } from '@/client/error';

//~---------------------------------------------------------------------------------------------~//
//$                                            KEYS                                             $//
//~---------------------------------------------------------------------------------------------~//

const TAG_NAMESPACE_QUERY_KEY = 'tag';

export const TAG_QUERY_KEYS = Object.freeze({
    namespace: TAG_NAMESPACE_QUERY_KEY,
    list: () => [TAG_NAMESPACE_QUERY_KEY, 'list'] as const
});

//~---------------------------------------------------------------------------------------------~//
//$                                          TYPES                                              $//
//~---------------------------------------------------------------------------------------------~//

export type TagListOptions = Omit<
    UseQueryOptions<
        TagListDTO[],
        RequestError,
        TagListDTO[],
        ReturnType<typeof TAG_QUERY_KEYS.list>
    >,
    'queryKey' | 'queryFn'
>;

export type TagSuggestionsOptions = Omit<
    UseMutationOptions<RecipeTagDTO[], RequestError, Recipe>,
    'mutationFn'
>;
