import type { Ingredient } from '@/client/types';
import { create } from 'zustand/index';

type IngredientSelectStore = Readonly<{
    /**
     * The currently selected ingredients.
     */
    selectedIngredients: Ingredient[];
    /**
     * Selects an ingredient.
     * @param ingredient - The ingredient to select.
     */
    selectIngredient: (ingredient: Ingredient) => void;
    /**
     * Deselects an ingredient.
     * @param ingredient - The ingredient to deselect.
     */
    deselectIngredient: (ingredient: Ingredient) => void;
    /**
     * Resets the selected ingredients.
     */
    resetSelectedIngredients: () => void;
}>;

export const useIngredientSelectStore = create<IngredientSelectStore>()(
    (set) => ({
        selectedIngredients: [],
        selectIngredient: (ingredient) =>
            set((state) => ({
                selectedIngredients: [...state.selectedIngredients, ingredient]
            })),
        deselectIngredient: (ingredient) =>
            set((state) => ({
                selectedIngredients: state.selectedIngredients.filter(
                    (selected) => selected.id !== ingredient.id
                )
            })),
        resetSelectedIngredients: () => set({ selectedIngredients: [] })
    })
);
