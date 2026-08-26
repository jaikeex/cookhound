import type { Ingredient } from '@/common/types';
import { create } from 'zustand';

type RecipeSelectionStore = Readonly<{
    activeRecipeId: number | null;
    selectedIngredientIds: number[];
    checkedInstructionIndexes: number[];
    setActiveRecipe: (recipeId: number) => void;
    selectIngredient: (recipeId: number, ingredient: Ingredient) => void;
    deselectIngredient: (recipeId: number, ingredient: Ingredient) => void;
    toggleInstruction: (recipeId: number, index: number) => void;
    resetSelection: () => void;
    getSelectedForRecipe: (recipeId: number) => number[];
}>;

export const useRecipeSelectionStore = create<RecipeSelectionStore>()(
    (set, get) => ({
        activeRecipeId: null,
        selectedIngredientIds: [],
        checkedInstructionIndexes: [],

        setActiveRecipe: (recipeId: number) =>
            set((state) =>
                state.activeRecipeId === recipeId
                    ? state
                    : {
                          activeRecipeId: recipeId,
                          selectedIngredientIds: [],
                          checkedInstructionIndexes: []
                      }
            ),

        selectIngredient: (recipeId: number, ingredient: Ingredient) =>
            set((state) => {
                if (state.activeRecipeId !== recipeId) return state;

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

        deselectIngredient: (recipeId: number, ingredient: Ingredient) =>
            set((state) => {
                if (state.activeRecipeId !== recipeId) return state;

                return {
                    selectedIngredientIds: state.selectedIngredientIds.filter(
                        (id) => id !== ingredient.id
                    )
                };
            }),

        toggleInstruction: (recipeId: number, index: number) =>
            set((state) => {
                if (state.activeRecipeId !== recipeId) return state;

                const isChecked =
                    state.checkedInstructionIndexes.includes(index);

                return {
                    checkedInstructionIndexes: isChecked
                        ? state.checkedInstructionIndexes.filter(
                              (i) => i !== index
                          )
                        : [...state.checkedInstructionIndexes, index]
                };
            }),

        resetSelection: () =>
            set({ selectedIngredientIds: [], checkedInstructionIndexes: [] }),

        getSelectedForRecipe: (recipeId: number) => {
            const { activeRecipeId, selectedIngredientIds } = get();
            return activeRecipeId === recipeId ? selectedIngredientIds : [];
        }
    })
);
