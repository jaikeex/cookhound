'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    ButtonBase,
    DraggableList,
    IngredientRowCreate
} from '@/client/components';
import type { Ingredient } from '@/common/types';
import { useLocale } from '@/client/store';

type IngredientsListCreateProps = Readonly<{
    onChange?: (value: Ingredient[]) => void;
}>;

export const IngredientsListCreate: React.FC<IngredientsListCreateProps> = ({
    onChange
}) => {
    const { t } = useLocale();

    // used only for the draggable list - should not be used to determine the order of ingredients
    const [ingredients, setIngredients] = useState<number[]>([0]);

    // used to store the actual ingredient values in the correct order
    const [ingredientValues, setIngredientValues] = useState<Ingredient[]>([]);

    const handleAddIngredient = useCallback(() => {
        setIngredients((prev) => {
            // Find the smallest missing index in the array, starting from 0
            const newIngredient = prev.length > 0 ? Math.max(...prev) + 1 : 0;
            return [...prev, newIngredient];
        });

        setIngredientValues((prev) => [...prev, {} as Ingredient]);

        // Focus the new ingredient
        setTimeout(() => {
            const ingredient = document.getElementById(
                'ingredient-quantity-' + ingredients.length
            );
            ingredient?.focus();
        }, 0);
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

    return (
        <React.Fragment>
            <DraggableList onReorder={setIngredients} values={ingredients}>
                {ingredients.map((key, index) => (
                    <IngredientRowCreate
                        dragIndex={key}
                        key={key}
                        index={index}
                        onAddIngredient={handleAddIngredient}
                        onRemove={handleRemoveIngredient(key)}
                        onChange={handleRowChange(index)}
                    />
                ))}
            </DraggableList>
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
