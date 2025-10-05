'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BaseInput, DraggableInputRow } from '@/client/components';
import type { Ingredient } from '@/common/types';
import { useCreateRecipeStore, useLocale } from '@/client/store';

type IngredientRowCreateProps = Readonly<{
    className?: string;
    dragIndex: number;
    index: number;
    onAddIngredient?: () => void;
    onChange?: (ingredient: Ingredient) => void;
    onRemove?: (index: number) => void;
    defaultIngredient?: Ingredient;
}>;

export const IngredientRowCreate: React.FC<IngredientRowCreateProps> = ({
    className,
    dragIndex,
    index,
    onAddIngredient,
    onChange,
    onRemove,
    defaultIngredient
}) => {
    const { t } = useLocale();

    const [ingredient, setIngredient] = useState<Ingredient>(
        defaultIngredient ?? ({} as Ingredient)
    );

    const { recipeObject } = useCreateRecipeStore();

    const disableHandling =
        index === 0 && recipeObject?.ingredients.length === 1;

    const handleRemove = useCallback(() => {
        onRemove && onRemove(index);
    }, [index, onRemove]);

    const handleNameKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                const quantityInput = document.getElementById(
                    `ingredient-quantity-${index}`
                );

                quantityInput?.focus();
            }
        },
        [index]
    );

    const handleQuantityKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                onAddIngredient && onAddIngredient();
            }
        },
        [onAddIngredient]
    );

    const handleQuantityChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newIngredient = {
                ...ingredient,
                quantity: e.target.value
            };
            setIngredient(newIngredient);
            onChange && onChange(newIngredient);
        },
        [ingredient, onChange]
    );

    const handleNameChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const newIngredient = {
                ...ingredient,
                name: e.target.value
            };
            setIngredient(newIngredient);
            onChange && onChange(newIngredient);
        },
        [ingredient, onChange]
    );
    useEffect(() => {
        if (ingredient.name || ingredient.quantity) {
            onChange && onChange(ingredient);
        }
        // This is intentional, only run this effect when the index changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index]);

    return (
        <DraggableInputRow
            index={dragIndex}
            className={className}
            onRemove={handleRemove}
            disableRemove={disableHandling}
            disableDrag={disableHandling}
        >
            <BaseInput
                defaultValue={defaultIngredient?.name}
                id={`ingredient-name-${index}`}
                name={`ingredient-name-${index}`}
                placeholder={
                    index === 0 ? t('app.recipe.ingredient-placeholder') : ''
                }
                onChange={handleNameChange}
                onKeyDown={handleNameKeyPress}
            />
            <BaseInput
                className={'w-1/4'}
                defaultValue={defaultIngredient?.quantity}
                id={`ingredient-quantity-${index}`}
                name={`ingredient-quantity-${index}`}
                placeholder={
                    index === 0
                        ? t('app.recipe.ingredient-quantity-placeholder')
                        : ''
                }
                onChange={handleQuantityChange}
                onKeyDown={handleQuantityKeyPress}
            />
        </DraggableInputRow>
    );
};
