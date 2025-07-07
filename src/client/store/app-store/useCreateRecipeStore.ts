import { MAX_SUGGESTIONS } from '@/common/constants';
import type { RecipeDTO } from '@/common/types';
import { create } from 'zustand/index';

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
//$                                            STORE                                            $//
//~---------------------------------------------------------------------------------------------~//

export const useCreateRecipeStore = create<CreateRecipeStore>()((set, get) => ({
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
