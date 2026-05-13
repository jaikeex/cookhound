'use client';

import { tagApiClient } from '@/client/request/apiClient/tag';
import type { TagRepository } from '@/client/data/tag/port';

/**
 * HTTP-backed implementation of {@link TagRepository}.
 */
export const httpTagRepository: TagRepository = {
    list: ({ language, signal }) => tagApiClient.getTags(language, { signal }),

    suggest: (recipe) => tagApiClient.getSuggestions(recipe)
};
