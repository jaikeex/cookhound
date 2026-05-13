import type { Locale } from '@/common/types';
import {
    useAppMutation,
    useAppQuery
} from '@/client/request/queryClient/queryFactories';
import { useRepositories } from '@/client/data';
import {
    TAG_QUERY_KEYS,
    type TagListOptions,
    type TagSuggestionsOptions
} from './keys';

export const tagQueryClient = {
    /**
     * Gets the full list of tag categories for the given locale.
     */
    useTags: (language: Locale, options?: Partial<TagListOptions>) => {
        const { tagRepository } = useRepositories();

        return useAppQuery(
            TAG_QUERY_KEYS.list(),
            ({ signal }) => tagRepository.list({ language, signal }),
            {
                staleTime: 10 * 60 * 1000, // 10 minutes
                ...options
            }
        );
    },

    /**
     * Asks the backend for AI-generated tag suggestions for a recipe.
     */
    useSuggestions: (options?: Partial<TagSuggestionsOptions>) => {
        const { tagRepository } = useRepositories();

        return useAppMutation(tagRepository.suggest, options);
    }
};
