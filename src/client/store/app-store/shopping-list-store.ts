import { create } from 'zustand/index';
import apiClient from '@/client/request';
import type {
    ShoppingListDTO,
    ShoppingListPayload,
    DeleteShoppingListPayload
} from '@/common/types';
import { deepClone } from '@/client/utils';

type ShoppingListStore = Readonly<{
    shoppingList: ShoppingListDTO[] | null;
    /** Temporary shopping list used while the user is in "edit" mode. */
    editingShoppingList: ShoppingListDTO[] | null;
    isLoading: boolean;
    error: unknown;

    initialize: (list: ShoppingListDTO[]) => void;

    startEditing: (current: ShoppingListDTO[]) => void;
    setEditingShoppingList: (list: ShoppingListDTO[] | null) => void;
    updateEditingShoppingList: (
        updater: (prev: ShoppingListDTO[] | null) => ShoppingListDTO[] | null
    ) => void;

    refreshShoppingList: () => Promise<void>;
    createShoppingList: (list: ShoppingListPayload) => Promise<void>;
    deleteShoppingList: () => Promise<void>;
    deleteRecipeShoppingList: (recipeId: number) => Promise<void>;
    updateShoppingList: (updates: ShoppingListPayload[]) => Promise<void>;
    markIngredient: (recipeId: number, ingredientId: number) => Promise<void>;
}>;

export const useShoppingListStore = create<ShoppingListStore>()((set, get) => ({
    shoppingList: null,
    editingShoppingList: null,
    isLoading: false,
    error: null,

    //§—————————————————————————————————————————————————————————————————————————————————————————————§//
    //§                                           WARNING                                           §//
    ///
    //# NONE of the functions here can ever throw an error. Instead set all errors into the
    //# error field and let the callers handle them that way.
    ///
    //§—————————————————————————————————————————————————————————————————————————————————————————————§//

    initialize: (list) => set({ shoppingList: list }),

    startEditing: (current) => {
        const cloned = deepClone(current);
        set({ editingShoppingList: cloned });
    },

    setEditingShoppingList: (list) => set({ editingShoppingList: list }),

    updateEditingShoppingList: (updater) =>
        set((state) => ({
            editingShoppingList: updater(state.editingShoppingList)
        })),

    refreshShoppingList: async () => {
        const list = await apiClient.user.getShoppingList();
        set({ shoppingList: list });
    },

    createShoppingList: async (list: ShoppingListPayload) => {
        set({ isLoading: true, error: null });

        try {
            const newList = await apiClient.user.upsertShoppingList(list);
            set({ shoppingList: newList });
        } catch (error) {
            set({ error });
        } finally {
            set({ isLoading: false });
        }
    },

    deleteShoppingList: async () => {
        const prev = get().shoppingList;
        set({ isLoading: true, error: null });

        // Optimistic update
        set({ shoppingList: [] });

        try {
            await apiClient.user.deleteShoppingList(
                {} as DeleteShoppingListPayload
            );
        } catch (error) {
            set({ shoppingList: prev, error });
        } finally {
            set({ isLoading: false });
        }
    },

    deleteRecipeShoppingList: async (recipeId: number) => {
        const prev = get().shoppingList;
        set({ isLoading: true, error: null });

        if (!prev) return;

        // Optimistic update – filter out given recipe
        const optimistic = prev.filter((entry) => entry.recipe.id !== recipeId);

        set({ shoppingList: optimistic });

        try {
            await apiClient.user.deleteShoppingList({ recipeId });
        } catch (error) {
            set({ shoppingList: prev, error });
        } finally {
            set({ isLoading: false });
        }
    },

    updateShoppingList: async (updates: ShoppingListPayload[]) => {
        if (updates.length === 0) return;

        /**
         * No optimistic update here since updating is meant to be done from a different
         * component than display.
         */

        set({ isLoading: true, error: null });

        try {
            let serverResult: ShoppingListDTO[] | null = null;

            // Every call returns the full list, only set the last one.
            for (const update of updates) {
                serverResult = await apiClient.user.updateShoppingList(update);
            }

            if (serverResult) {
                set({ shoppingList: serverResult });
            }
        } catch (error) {
            set({ error });
        } finally {
            set({ isLoading: false });
        }
    },

    markIngredient: async (recipeId, ingredientId) => {
        const prev = get().shoppingList;
        set({ error: null });

        if (!prev) return;

        // Optimistically merge the incoming updates into the local state.
        const optimisticallyUpdated = prev.map((entry) => {
            if (entry.recipe.id !== recipeId) return entry;

            const ingredient = entry.ingredients.find(
                (ing) => ing.id === ingredientId
            );

            if (!ingredient) return entry;

            return {
                ...entry,
                ingredients: entry.ingredients.map((ing) =>
                    ing.id === ingredientId
                        ? { ...ing, marked: !ing.marked }
                        : ing
                )
            };
        });

        set({ shoppingList: optimisticallyUpdated });

        try {
            const recipe = prev.find((entry) => entry.recipe.id === recipeId);

            if (!recipe) {
                throw new Error('Recipe not found');
            }

            const ingredient = recipe?.ingredients.find(
                (ing) => ing.id === ingredientId
            );

            if (!ingredient) {
                throw new Error('Ingredient not found');
            }

            const payload: ShoppingListPayload = {
                recipeId,
                ingredients: [
                    {
                        id: ingredient.id,
                        marked: !ingredient.marked,
                        quantity: ingredient.quantity
                    }
                ]
            };

            await apiClient.user.upsertShoppingList(payload);
        } catch (error) {
            set({ shoppingList: prev, error });
        } finally {
            set({ isLoading: false });
        }
    }
}));
