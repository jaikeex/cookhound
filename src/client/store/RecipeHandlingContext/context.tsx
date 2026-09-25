'use client';

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState
} from 'react';
import type { Recipe, User } from '@/common/types';
import { useAuth, useRecipeSelectionStore, useSnackbar } from '@/client/store';
import { useShoppingList } from '@/client/hooks';
import { scaleIngredientsToPortionSize } from '@/client/utils';
import { chqc } from '@/client/data';
import { useRouter } from 'next/navigation';
import { t } from '@/client/locales';
import { getErrorMessage } from '@/client/error';

//~=============================================================================================~//
//$                                            TYPES                                            $//
//~=============================================================================================~//

type RecipeHandlingContextType = Readonly<{
    /**
     * The recipe being displayed.
     */
    recipe: Recipe;
    /**
     * The recipe's author, when the server already loaded it.
     */
    author?: User;
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

const RecipeHandlingContext = createContext<
    RecipeHandlingContextType | undefined
>(undefined);

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
        author?: User;
        recipe: Recipe;
    }>
>;

export const RecipeHandlingProvider: React.FC<RecipeHandlingProviderProps> = ({
    author,
    recipe,
    children
}) => {
    const { user } = useAuth();
    const { alert } = useSnackbar();
    const router = useRouter();
    const { createShoppingList } = useShoppingList();

    const [portionSize, setPortionSizeState] = useState(recipe.portionSize);

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
    //$                                   RECIPE ACTIONS                                        $//
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

    const { mutate: rateRecipeMutate } = chqc.recipe.useRateRecipe({
        onSuccess: () => {
            alert({
                message: t('app.recipe.rated'),
                variant: 'success'
            });

            // The recipe comes from the (revalidated) server render, not from a client query.
            setTimeout(() => {
                router.refresh();
            }, 1000);
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

        const selectedIds = useRecipeSelectionStore
            .getState()
            .getSelectedForRecipe(recipe.id);

        const ingredientsToInclude = scaledIngredients
            .filter((ingredient) => !selectedIds.includes(ingredient.id))
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
            alert({ message: getErrorMessage(error), variant: 'error' });
        }
    }, [
        recipe.ingredients,
        recipe.portionSize,
        recipe.id,
        portionSize,
        createShoppingList,
        alert,
        user
    ]);

    const value = useMemo(
        () => ({
            recipe,
            author,
            portionSize,
            setPortionSize,
            incrementPortionSize,
            decrementPortionSize,
            rateRecipe,
            onShoppingListCreate
        }),
        [
            recipe,
            author,
            portionSize,
            setPortionSize,
            incrementPortionSize,
            decrementPortionSize,
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
