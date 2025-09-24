import React from 'react';
import type { Ingredient } from '@/common/types';
import { IngredientRowView } from '@/client/components';
import { useIngredientSelectStore } from '@/client/store';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const classConfig = {
    spacing: {
        'desktop': 'space-y-2',
        'mobile': 'space-y-4'
    }
};

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

type IngredientsListViewProps = Readonly<{
    className?: string;
    ingredients: Ingredient[];
    isPreview?: boolean;
    variant?: 'desktop' | 'mobile';
}>;

export const IngredientsListView: React.FC<IngredientsListViewProps> = ({
    className,
    ingredients,
    isPreview = false,
    variant = 'desktop'
}) => {
    const { selectIngredient, deselectIngredient, selectedIngredients } =
        useIngredientSelectStore();

    const ingredientsToDisplay = ingredients.filter((ingredient) => {
        const isNameEmpty = !ingredient.name || ingredient.name === '';
        const isQuantityEmpty =
            !ingredient.quantity || ingredient.quantity === '';

        return !isNameEmpty || !isQuantityEmpty;
    });

    return (
        <div className={`${classConfig.spacing[variant]} ${className}`}>
            {ingredientsToDisplay.map((ingredient, index) => (
                <IngredientRowView
                    disabled={isPreview}
                    ingredient={ingredient}
                    key={index}
                    onDeselected={deselectIngredient}
                    onSelected={selectIngredient}
                    variant={variant}
                    selected={selectedIngredients.some(
                        (selectedIngredient) =>
                            selectedIngredient.name === ingredient.name
                    )}
                />
            ))}
        </div>
    );
};
