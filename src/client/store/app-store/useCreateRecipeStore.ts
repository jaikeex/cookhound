import { MAX_SUGGESTIONS } from '@/common/constants';
import type { RecipeDTO } from '@/common/types';
import { create } from 'zustand';

type CreateRecipeStore = Readonly<{
    recipeObject: RecipeDTO | null;
    suggestionsUsed: number;
    setRecipeObject: (recipeObject: RecipeDTO) => void;
    updateRecipeObject: (name: string, value: any) => void;
    incrementSuggestions: () => void;
    getRemainingsuggestions: () => number;
    canSuggest: () => boolean;
    resetSuggestions: () => void;
}>;

//~---------------------------------------------------------------------------------------------~//
//$                                     STORE INITIALIZER                                       $//
//~---------------------------------------------------------------------------------------------~//

const initializeStore = () =>
    create<CreateRecipeStore>()((set, get) => ({
        recipeObject: null,
        suggestionsUsed: 0,

        setRecipeObject: (recipeObject: RecipeDTO) => set({ recipeObject }),

        updateRecipeObject: (name: string, value: any) =>
            set((state) => {
                if (!state.recipeObject) return { recipeObject: null };
                return {
                    recipeObject: {
                        ...state.recipeObject,
                        [name]: value
                    }
                };
            }),

        incrementSuggestions: () =>
            set((state) => ({
                suggestionsUsed: state.suggestionsUsed + 1
            })),

        getRemainingsuggestions: () => {
            const { suggestionsUsed } = get();
            return Math.max(0, MAX_SUGGESTIONS - suggestionsUsed);
        },

        canSuggest: () => {
            const { suggestionsUsed } = get();
            return suggestionsUsed < MAX_SUGGESTIONS;
        },

        resetSuggestions: () => set({ suggestionsUsed: 0 })
    }));

//~---------------------------------------------------------------------------------------------~//
//$                                   SINGLETON RESOLUTION                                      $//
//~---------------------------------------------------------------------------------------------~//

/**
 * Returns the singleton store instance on the client.
 * – On the server (SSR/SSG), always create a new store to avoid cross-user leakage.
 * – On the client, cache the store on `globalThis` so that re-evaluating this module
 *   during search-param navigations (modals and sidebars!!) (or hmr) reuses the same instance.
 */
function getStore() {
    if (typeof window === 'undefined') {
        // ❄️  Server – fresh store per render for safety.
        return initializeStore();
    }

    const globalWithStore = window as unknown as {
        __COOKHOUND_CREATE_RECIPE_STORE__?: ReturnType<typeof initializeStore>;
    };

    if (!globalWithStore.__COOKHOUND_CREATE_RECIPE_STORE__) {
        globalWithStore.__COOKHOUND_CREATE_RECIPE_STORE__ = initializeStore();
    }

    return globalWithStore.__COOKHOUND_CREATE_RECIPE_STORE__;
}

export const useCreateRecipeStore = getStore();
