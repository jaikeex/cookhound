import {
    useAppMutation,
    useAppQuery
} from '@/client/request/queryClient/queryFactories';
import apiClient from '@/client/request/apiClient';
import {
    TAG_QUERY_KEYS,
    type TagListOptions,
    type TagSuggestionsOptions
} from './types';
import type { RecipeDTO } from '@/common/types';
import type { Locale } from '@/client/locales';

class TagQueryClient {
    useTags = (language: Locale, options?: Partial<TagListOptions>) =>
        useAppQuery(
            TAG_QUERY_KEYS.list(),
            () => apiClient.tag.getTags(language),
            {
                staleTime: 10 * 60 * 1000, // 10 minutes
                ...options
            }
        );

    useSuggestions = (options?: Partial<TagSuggestionsOptions>) =>
        useAppMutation(
            (recipe: RecipeDTO) => apiClient.tag.getSuggestions(recipe),
            options
        );
}

export const tagQueryClient = new TagQueryClient();
