'use client';

import { cookbookApiClient } from '@/client/request/apiClient/cookbook';
import { reviveCookbookDates } from '@/client/data/cookbook/revive';
import type { CookbookRepository } from '@/client/data/cookbook/port';

/**
 * HTTP-backed implementation of {@link CookbookRepository}.
 */
export const httpCookbookRepository: CookbookRepository = {
    getById: async ({ id, signal }) => {
        const dto = await cookbookApiClient.getCookbookById(id, { signal });
        return reviveCookbookDates(dto);
    },

    getByDisplayId: async ({ displayId, signal }) => {
        const dto = await cookbookApiClient.getCookbookByDisplayId(displayId, {
            signal
        });
        return reviveCookbookDates(dto);
    },

    listByUser: async ({ userId, signal }) => {
        const dtos = await cookbookApiClient.getCookbooksByUserId(userId, {
            signal
        });
        return dtos.map(reviveCookbookDates);
    },

    create: async ({ input }) => {
        const dto = await cookbookApiClient.createCookbook(input);
        return reviveCookbookDates(dto);
    },

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
