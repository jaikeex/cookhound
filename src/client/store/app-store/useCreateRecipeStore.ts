import type { RecipeDTO } from '@/common/types';
import { create } from 'zustand/index';

type CreateRecipeStore = Readonly<{
    recipeObject: RecipeDTO | null;
    setRecipeObject: (recipeObject: RecipeDTO) => void;
    updateRecipeObject: (name: string, value: any) => void;
}>;

export const useCreateRecipeStore = create<CreateRecipeStore>()((set) => ({
    recipeObject: null,
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
        })
}));
