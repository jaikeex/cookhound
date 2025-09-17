'use client';

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
    ButtonBase,
    DraggableList,
    IngredientRowCreate
} from '@/client/components';
import type { Ingredient } from '@/common/types';
import { useLocale } from '@/client/store';

type IngredientsListCreateProps = Readonly<{
    defaultIngredients?: Ingredient[] | null;
    onChange?: (value: Ingredient[]) => void;
}>;

export const IngredientsListCreate: React.FC<IngredientsListCreateProps> = ({
    defaultIngredients,
    onChange
}) => {
    const { t } = useLocale();

    // used only for the draggable list - should not be used to determine the order of ingredients
    const [ingredients, setIngredients] = useState<number[]>(() =>
        defaultIngredients && defaultIngredients.length > 0
            ? defaultIngredients?.map((_, idx) => idx)
            : [0]
    );

    // used to store the actual ingredient values in the correct order
    const [ingredientValues, setIngredientValues] = useState<Ingredient[]>(
        () => defaultIngredients ?? []
    );

    useEffect(() => {
        if (!defaultIngredients) return;

        setIngredients(defaultIngredients.map((_, idx) => idx));
        setIngredientValues(defaultIngredients);
    }, [defaultIngredients]);

    const handleAddIngredient = useCallback(() => {
        setIngredients((prev) => {
            // Find the smallest missing index in the array, starting from 0
            const newIngredient = prev.length > 0 ? Math.max(...prev) + 1 : 0;
            return [...prev, newIngredient];
        });

        setIngredientValues((prev) => [...prev, {} as Ingredient]);

        /**
         * The autofocus on mobile is quite annoying, so it is disabled there for now.
         * Use lazy evaluation of window size to prevent re-renders on resize.
         */
        if (typeof window !== 'undefined' && window.innerWidth >= 1140) {
            // Focus the new ingredient
            setTimeout(() => {
                const ingredient = document.getElementById(
                    'ingredient-name-' + ingredients.length
                );
                ingredient?.focus();
            }, 0);
        }
    }, [ingredients.length]);

    const handleRemoveIngredient = useCallback(
        (key: number) => (index: number) => {
            setIngredients((prev) => prev.filter((i) => i !== key));
            setIngredientValues((prev) =>
                prev.filter((i, idx) => idx !== index)
            );
        },
        []
    );

    const handleRowChange = useCallback(
        (index: number) => (ingredient: Ingredient) => {
            setIngredientValues((prev) => {
                const newIngredients = [...prev];
                newIngredients[index] = ingredient;
                return newIngredients;
            });
        },
        []
    );

    useEffect(() => {
        onChange && onChange(ingredientValues);
    }, [ingredientValues, onChange]);

    const handleReorder = useCallback(
        (newOrder: number[]) => {
            // Reorder the ingredient keys first
            setIngredients(newOrder);

            // Then reorder the actual ingredient values to keep them in sync
            setIngredientValues((prevValues) => {
                // Map the previous key -> value for quick lookup
                const keyToValue = new Map<number, Ingredient>();
                ingredients.forEach((key, idx) => {
                    keyToValue.set(key, prevValues[idx]);
                });

                return newOrder.map(
                    (key) => keyToValue.get(key) ?? ({} as Ingredient)
                );
            });
        },
        [ingredients]
    );

    // Memoize the DraggableList to prevent unnecessary re-renders during screen size changes
    const draggableList = useMemo(
        () => (
            <DraggableList onReorder={handleReorder} values={ingredients}>
                {ingredients.map((key, index) => (
                    <IngredientRowCreate
                        dragIndex={key}
                        key={key}
                        index={index}
                        defaultIngredient={ingredientValues[index]}
                        onAddIngredient={handleAddIngredient}
                        onRemove={handleRemoveIngredient(key)}
                        onChange={handleRowChange(index)}
                    />
                ))}
            </DraggableList>
        ),
        [
            ingredients,
            ingredientValues,
            handleReorder,
            handleAddIngredient,
            handleRemoveIngredient,
            handleRowChange
        ]
    );

    return (
        <React.Fragment>
            {draggableList}
            <ButtonBase
                className={'w-full'}
                icon={'plus'}
                color={'subtle'}
                size={'sm'}
                onClick={handleAddIngredient}
            >
                {t('app.recipe.add-ingredient')}
            </ButtonBase>
        </React.Fragment>
    );
};
