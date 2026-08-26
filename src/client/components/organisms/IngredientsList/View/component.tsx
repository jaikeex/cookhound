'use client';

import React, { useCallback, useMemo } from 'react';
import type { Ingredient } from '@/common/types';
import { IngredientRowView } from '@/client/components/molecules/IngredientRow/View';
import { Typography } from '@/client/components/atoms/Typography';
import { useRecipeHandling, useRecipeSelectionStore } from '@/client/store';
import { scaleIngredientsToPortionSize } from '@/client/utils';

const ROW_SPACING = 'space-y-4 @recipe:space-y-2';

const EMPTY_SELECTION: readonly number[] = Object.freeze([]);

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

type IngredientsListViewProps = Readonly<{
    className?: string;
    ingredients: Ingredient[];
    isPreview?: boolean;
}>;

export const IngredientsListView: React.FC<IngredientsListViewProps> = ({
    className,
    ingredients,
    isPreview = false
}) => {
    const { recipe, portionSize } = useRecipeHandling();

    const selectIngredient = useRecipeSelectionStore(
        (state) => state.selectIngredient
    );

    const deselectIngredient = useRecipeSelectionStore(
        (state) => state.deselectIngredient
    );

    // Excludes the preview outright: it renders a recipe being edited rather
    // than cooked, and its id can equal the active one.
    const selectedIngredientIds = useRecipeSelectionStore((state) =>
        !isPreview && state.activeRecipeId === recipe.id
            ? state.selectedIngredientIds
            : EMPTY_SELECTION
    );

    const handleSelect = useCallback(
        (ingredient: Ingredient) => selectIngredient(recipe.id, ingredient),
        [recipe.id, selectIngredient]
    );

    const handleDeselect = useCallback(
        (ingredient: Ingredient) => deselectIngredient(recipe.id, ingredient),
        [recipe.id, deselectIngredient]
    );

    const originalPortionSize = recipe.portionSize;

    const validIngredients = useMemo(
        () =>
            ingredients.filter((ingredient) => {
                const isNameEmpty = !ingredient.name || ingredient.name === '';
                const isQuantityEmpty =
                    !ingredient.quantity || ingredient.quantity === '';

                return !isNameEmpty || !isQuantityEmpty;
            }),
        [ingredients]
    );

    const portionSizedIngredients = useMemo(
        () =>
            scaleIngredientsToPortionSize(
                validIngredients,
                originalPortionSize,
                portionSize
            ),
        [originalPortionSize, portionSize, validIngredients]
    );

    const grouped = useMemo(() => {
        const categoryOrderMap = new Map<string, number>();
        const maxCategoryOrder = Math.max(
            ...portionSizedIngredients.map((ing) => ing.categoryOrder || 0)
        );

        portionSizedIngredients.forEach((ing) => {
            if (
                ing.category &&
                ing.categoryOrder !== null &&
                ing.categoryOrder !== undefined
            ) {
                if (!categoryOrderMap.has(ing.category)) {
                    categoryOrderMap.set(ing.category, ing.categoryOrder);
                }
            } else if (ing.category && !categoryOrderMap.has(ing.category)) {
                categoryOrderMap.set(ing.category, maxCategoryOrder + 1);
            }
        });

        const sortedCategories = Array.from(categoryOrderMap.entries())
            .sort((a, b) => a[1] - b[1])
            .map(([name]) => name);

        const uncategorized: Ingredient[] = [];
        const categorized = new Map<string, Ingredient[]>();

        sortedCategories.forEach((cat) => categorized.set(cat, []));

        portionSizedIngredients.forEach((ing) => {
            if (ing.category) {
                const arr = categorized.get(ing.category);
                if (arr) arr.push(ing);
            } else {
                uncategorized.push(ing);
            }
        });

        return { uncategorized, categorized, sortedCategories };
    }, [portionSizedIngredients]);

    const renderIngredient = (ingredient: Ingredient, index: number) => (
        <IngredientRowView
            key={index}
            disabled={isPreview}
            ingredient={ingredient}
            onDeselected={handleDeselect}
            onSelected={handleSelect}
            variant={'responsive'}
            selected={selectedIngredientIds.includes(ingredient.id)}
        />
    );

    return (
        <div className={`space-y-6 ${className}`}>
            {grouped.uncategorized.length > 0 && (
                <div className={ROW_SPACING}>
                    {grouped.uncategorized.map(renderIngredient)}
                </div>
            )}

            {grouped.sortedCategories.map((categoryName) => {
                const categoryIngredients =
                    grouped.categorized.get(categoryName) || [];
                if (categoryIngredients.length === 0) return null;

                return (
                    <div key={categoryName}>
                        <Typography
                            variant="body-md"
                            className="font-semibold mb-3 text-gray-900 dark:text-gray-100"
                        >
                            {categoryName}
                        </Typography>

                        <div className={ROW_SPACING}>
                            {categoryIngredients.map(renderIngredient)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
