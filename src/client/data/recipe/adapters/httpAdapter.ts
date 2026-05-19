'use client';

import { recipeApiClient } from '@/client/request/apiClient/recipe/RecipeApiClient';
import { reviveRecipeDates } from '@/client/data/recipe/revive';
import type { RecipeRepository } from '@/client/data/recipe/port';

/**
 * HTTP-backed implementation of {@link RecipeRepository}.
 */
export const httpRecipeRepository: RecipeRepository = {
    getById: async ({ id, signal }) => {
        const dto = await recipeApiClient.getRecipeById(id, { signal });
        return reviveRecipeDates(dto);
    },

    getByDisplayId: async ({ displayId, signal }) => {
        const dto = await recipeApiClient.getRecipeByDisplayId(displayId, {
            signal
        });

        return reviveRecipeDates(dto);
    },

    list: ({ language, batch, perPage, signal }) =>
        recipeApiClient.getRecipeList(language, batch, perPage, { signal }),

    search: ({ query, language, batch, perPage, signal }) =>
        recipeApiClient.searchRecipes(query, language, batch, perPage, {
            signal
        }),

    listByUser: ({ userId, language, batch, perPage, signal }) =>
        recipeApiClient.getUserRecipes(userId, language, batch, perPage, {
            signal
        }),

    searchByUser: ({ userId, query, language, batch, perPage, signal }) =>
        recipeApiClient.searchUserRecipes(
            userId,
            query,
            language,
            batch,
            perPage,
            { signal }
        ),

    filter: ({ language, batch, perPage, filters, signal }) =>
        recipeApiClient.filterRecipes(language, batch, perPage, filters, {
            signal
        }),

    create: async ({ input }) => {
        const dto = await recipeApiClient.createRecipe(input);
        return reviveRecipeDates(dto);
    },

    update: async ({ id, patch }) => {
        const dto = await recipeApiClient.updateRecipe(id, patch);
        return reviveRecipeDates(dto);
    },

    delete: async ({ id }) => {
        await recipeApiClient.deleteRecipe(id);
    },

    rate: async ({ id, rating }) => {
        await recipeApiClient.rateRecipe(id, rating);
    },

    registerVisit: ({ id, userId }) =>
        recipeApiClient.registerRecipeVisit(id, userId),

    submitAppeal: (args) => recipeApiClient.submitAppeal(args)
};
