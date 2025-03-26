'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { BaseInput } from '@/client/components';
import { DraggableInputRow } from '@/client/components/molecules/Form/DraggableInputRow';
import type { Ingredient } from '@/client/types';

type IngredientRowCreateProps = Readonly<{
    className?: string;
    dragIndex: number;
    index: number;
    onAddIngredient?: () => void;
    onChange?: (ingredient: Ingredient) => void;
    onRemove?: (index: number) => void;
}>;

export const IngredientRowCreate: React.FC<IngredientRowCreateProps> = ({
    className,
    dragIndex,
    index,
    onAddIngredient,
    onChange,
    onRemove
}) => {
    const [ingredient, setIngredient] = useState<Ingredient>({} as Ingredient);

    const handleRemove = useCallback(() => {
        onRemove && onRemove(index);
    }, [index, onRemove]);

    const handleQuantityKeyPress = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                const nameInput = document.getElementById(
                    `ingredient-name-${index}`
                );

                nameInput?.focus();
            }
        },
        [index]
    );

    const handleNameKeyPress = useCallback(
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
        onChange && onChange(ingredient);
        // This is intentional, only run this effect when the index changes
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [index]);

    return (
        <DraggableInputRow
            index={dragIndex}
            className={className}
            onRemove={handleRemove}
        >
            <BaseInput
                className={'w-1/4'}
                id={`ingredient-quantity-${index}`}
                name={`ingredient-quantity-${index}`}
                placeholder={index === 0 ? '200 g' : ''}
                onChange={handleQuantityChange}
                onKeyDown={handleQuantityKeyPress}
            />

            <BaseInput
                id={`ingredient-name-${index}`}
                name={`ingredient-name-${index}`}
                placeholder={index === 0 ? 'Cibule' : ''}
                onChange={handleNameChange}
                onKeyDown={handleNameKeyPress}
            />
        </DraggableInputRow>
    );
};
