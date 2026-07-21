'use client';

import { tagApiClient } from '@/client/request/apiClient/tag';
import type { TagRepository } from '@/client/data/tag/port';

/**
 * HTTP-backed implementation of {@link TagRepository}.
 */
export const httpTagRepository: TagRepository = {
    list: ({ signal }) => tagApiClient.getTags({ signal }),

    suggest: (recipe) => tagApiClient.getSuggestions(recipe)
};
