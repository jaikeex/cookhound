import { useAppQuery } from '@/client/request/queryClient/queryFactories';
import apiClient from '@/client/request/apiClient';
import { TAG_QUERY_KEYS, type TagListOptions } from './types';

class TagQueryClient {
    useTags = (language: string, options?: Partial<TagListOptions>) =>
        useAppQuery(
            TAG_QUERY_KEYS.list(),
            () => apiClient.tag.getTags(language),
            {
                staleTime: 10 * 60 * 1000, // 10 minutes
                ...options
            }
        );
}

export const tagQueryClient = new TagQueryClient();
