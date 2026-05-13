'use client';

import { cookbookApiClient } from '@/client/request/apiClient/cookbook';
import type { CookbookRepository } from '@/client/data/cookbook/port';

/**
 * HTTP-backed implementation of {@link CookbookRepository}.
 */
export const httpCookbookRepository: CookbookRepository = {
    getById: ({ id, signal }) =>
        cookbookApiClient.getCookbookById(id, { signal }),

    getByDisplayId: ({ displayId, signal }) =>
        cookbookApiClient.getCookbookByDisplayId(displayId, { signal }),

    listByUser: ({ userId, signal }) =>
        cookbookApiClient.getCookbooksByUserId(userId, { signal }),

    create: ({ input }) => cookbookApiClient.createCookbook(input),

    delete: async ({ id }) => {
        await cookbookApiClient.deleteCookbook(id);
    },

    reorderOwn: async ({ orderedCookbookIds }) => {
        await cookbookApiClient.reorderOwnCookbooks(orderedCookbookIds);
    },

    addRecipe: async ({ cookbookId, recipeId }) => {
        await cookbookApiClient.addRecipeToCookbook(cookbookId, recipeId);
    },

    removeRecipe: async ({ cookbookId, recipeId }) => {
        await cookbookApiClient.removeRecipeFromCookbook(cookbookId, recipeId);
    },

    reorderRecipes: async ({ cookbookId, orderedRecipeIds }) => {
        await cookbookApiClient.reorderCookbookRecipes(
            cookbookId,
            orderedRecipeIds
        );
    }
};
