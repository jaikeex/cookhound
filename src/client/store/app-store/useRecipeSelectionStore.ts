import type { Ingredient } from '@/common/types';
import { create } from 'zustand';

type RecipeSelectionStore = Readonly<{
    activeRecipeId: number | null;
    selectedIngredientIds: number[];
    /**
     * Activate a recipe. If different from the currently active one, clears the selection.
     */
    setActiveRecipe: (recipeId: number) => void;
    selectIngredient: (ingredient: Ingredient) => void;
    deselectIngredient: (ingredient: Ingredient) => void;
    resetSelection: () => void;
    /**
     * Returns the selected ingredient ids scoped to a single recipe.
     */
    getSelectedForRecipe: (recipeId: number) => number[];
}>;

export const useRecipeSelectionStore = create<RecipeSelectionStore>()(
    (set, get) => ({
        activeRecipeId: null,
        selectedIngredientIds: [],

        setActiveRecipe: (recipeId: number) =>
            set((state) =>
                state.activeRecipeId === recipeId
                    ? state
                    : { activeRecipeId: recipeId, selectedIngredientIds: [] }
            ),

        selectIngredient: (ingredient: Ingredient) =>
            set((state) => {
                if (state.activeRecipeId === null) return state;

                if (state.selectedIngredientIds.includes(ingredient.id)) {
                    return state;
                }

                return {
                    selectedIngredientIds: [
                        ...state.selectedIngredientIds,
                        ingredient.id
                    ]
                };
            }),

        deselectIngredient: (ingredient: Ingredient) =>
            set((state) => {
                if (state.activeRecipeId === null) return state;
                return {
                    selectedIngredientIds: state.selectedIngredientIds.filter(
                        (id) => id !== ingredient.id
                    )
                };
            }),

        resetSelection: () => set({ selectedIngredientIds: [] }),

        getSelectedForRecipe: (recipeId: number) => {
            const { activeRecipeId, selectedIngredientIds } = get();
            return activeRecipeId === recipeId ? selectedIngredientIds : [];
        }
    })
);
