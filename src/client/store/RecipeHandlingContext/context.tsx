'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import type { Ingredient, RecipeDTO } from '@/common/types';
import { useAuth, useLocale, useSnackbar } from '@/client/store';
import { useShoppingList } from '@/client/hooks';
import { scaleIngredientsToPortionSize } from '@/client/utils';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

//~=============================================================================================~//
//$                                            TYPES                                            $//
//~=============================================================================================~//

type RecipeHandlingContextType = Readonly<{
    /**
     * The recipe being displayed.
     */
    recipe: RecipeDTO;
    /**
     * The currently selected portion size.
     */
    portionSize: number | null;
    /**
     * Set the portion size directly.
     */
    setPortionSize: (value: number) => void;
    /**
     * Increment the portion size by 1.
     */
    incrementPortionSize: () => void;
    /**
     * Decrement the portion size by 1.
     */
    decrementPortionSize: () => void;
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
    /**
     * Rate the recipe.
     * @param rating - The rating value.
     */
    rateRecipe: (rating: number) => void;
    /**
     * Create a shopping list from the recipe, excluding selected ingredients.
     */
    onShoppingListCreate: () => Promise<void>;
}>;

//~=============================================================================================~//
//$                                          PROVIDER                                           $//
//~=============================================================================================~//

const RecipeHandlingContext = createContext({} as RecipeHandlingContextType);

export const useRecipeHandling = () => {
    const context = useContext(RecipeHandlingContext);

    if (!context) {
        throw new Error(
            'useRecipeHandling must be used within a RecipeHandlingProvider'
        );
    }

    return context;
};

type RecipeHandlingProviderProps = React.PropsWithChildren<
    Readonly<{
        recipe: RecipeDTO;
    }>
>;

export const RecipeHandlingProvider: React.FC<RecipeHandlingProviderProps> = ({
    recipe,
    children
}) => {
    const { t } = useLocale();
    const { user } = useAuth();
    const { alert } = useSnackbar();
    const router = useRouter();
    const queryClient = useQueryClient();
    const { createShoppingList } = useShoppingList();

    const [portionSize, setPortionSizeState] = useState(recipe.portionSize);
    const [selectedIngredients, setSelectedIngredients] = useState<
        Ingredient[]
    >([]);

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                                    PORTION SIZE                                         $//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    const setPortionSize = useCallback((value: number) => {
        if (value < 1 || value > 100) {
            return;
        }

        setPortionSizeState(value);
    }, []);

    const incrementPortionSize = useCallback(() => {
        setPortionSizeState((current) => {
            if (!current || current >= 100) {
                return current;
            }

            return current + 1;
        });
    }, []);

    const decrementPortionSize = useCallback(() => {
        setPortionSizeState((current) => {
            if (!current || current <= 1) {
                return current;
            }

            return current - 1;
        });
    }, []);

    // The primary use of this is to update the portions when creating a recipe.
    useEffect(() => {
        setPortionSizeState(recipe.portionSize);
    }, [recipe.portionSize]);

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                                 INGREDIENT SELECT                                       $//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    const selectIngredient = useCallback((ingredient: Ingredient) => {
        setSelectedIngredients((current) => [...current, ingredient]);
    }, []);

    const deselectIngredient = useCallback((ingredient: Ingredient) => {
        setSelectedIngredients((current) =>
            current.filter((selected) => selected.id !== ingredient.id)
        );
    }, []);

    const resetSelectedIngredients = useCallback(() => {
        setSelectedIngredients([]);
    }, []);

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//
    //$                                   RECIPE ACTIONS                                        $//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    const { mutate: rateRecipeMutate } = chqc.recipe.useRateRecipe({
        onSuccess: async () => {
            alert({
                message: t('app.recipe.rated'),
                variant: 'success'
            });

            // Invalidate is not sufficient here.
            await queryClient.refetchQueries({
                queryKey: QUERY_KEYS.recipe.byDisplayId(recipe.displayId)
            });

            setTimeout(() => {
                router.refresh();
            }, 1000);
        },
        onError: () => {
            alert({
                message: t('app.error.default'),
                variant: 'error'
            });
        }
    });

    const rateRecipe = useCallback(
        (rating: number) => {
            rateRecipeMutate({
                id: recipe.id.toString(),
                rating
            });
        },
        [recipe.id, rateRecipeMutate]
    );

    const onShoppingListCreate = useCallback(async () => {
        const scaledIngredients = scaleIngredientsToPortionSize(
            recipe.ingredients,
            recipe.portionSize,
            portionSize
        );

        const ingredientsToInclude = scaledIngredients
            .filter(
                (ingredient) =>
                    !selectedIngredients.some((i) => i.id === ingredient.id)
            )
            .map((ingredient) => ({
                id: ingredient.id,
                quantity: ingredient.quantity,
                marked: false
            }));

        if (!user) return;

        try {
            await createShoppingList({
                recipeId: recipe.id,
                ingredients: ingredientsToInclude
            });

            alert({
                message: t('app.shopping-list.edited'),
                variant: 'success'
            });
        } catch (error: unknown) {
            alert({
                message: t('app.error.default'),
                variant: 'error'
            });
        }
    }, [
        recipe.ingredients,
        recipe.portionSize,
        recipe.id,
        portionSize,
        selectedIngredients,
        createShoppingList,
        alert,
        t,
        user
    ]);

    const value = useMemo(
        () => ({
            recipe,
            portionSize,
            setPortionSize,
            incrementPortionSize,
            decrementPortionSize,
            selectedIngredients,
            selectIngredient,
            deselectIngredient,
            resetSelectedIngredients,
            rateRecipe,
            onShoppingListCreate
        }),
        [
            recipe,
            portionSize,
            setPortionSize,
            incrementPortionSize,
            decrementPortionSize,
            selectedIngredients,
            selectIngredient,
            deselectIngredient,
            resetSelectedIngredients,
            rateRecipe,
            onShoppingListCreate
        ]
    );

    return (
        <RecipeHandlingContext.Provider value={value}>
            {children}
        </RecipeHandlingContext.Provider>
    );
};
