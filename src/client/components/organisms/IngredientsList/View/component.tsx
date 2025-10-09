import React, { useMemo } from 'react';
import type { Ingredient } from '@/common/types';
import { IngredientRowView, Typography } from '@/client/components';
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

    const validIngredients = ingredients.filter((ingredient) => {
        const isNameEmpty = !ingredient.name || ingredient.name === '';
        const isQuantityEmpty =
            !ingredient.quantity || ingredient.quantity === '';
        return !isNameEmpty || !isQuantityEmpty;
    });

    const grouped = useMemo(() => {
        const categoryOrderMap = new Map<string, number>();
        const maxCategoryOrder = Math.max(
            ...validIngredients.map((ing) => ing.categoryOrder || 0)
        );

        validIngredients.forEach((ing) => {
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

        validIngredients.forEach((ing) => {
            if (ing.category) {
                const arr = categorized.get(ing.category);
                if (arr) arr.push(ing);
            } else {
                uncategorized.push(ing);
            }
        });

        return { uncategorized, categorized, sortedCategories };
    }, [validIngredients]);

    const renderIngredient = (ingredient: Ingredient, index: number) => (
        <IngredientRowView
            key={index}
            disabled={isPreview}
            ingredient={ingredient}
            onDeselected={deselectIngredient}
            onSelected={selectIngredient}
            variant={variant}
            selected={selectedIngredients.some(
                (selectedIngredient) =>
                    selectedIngredient.name === ingredient.name
            )}
        />
    );

    return (
        <div className={`space-y-6 ${className}`}>
            {grouped.uncategorized.length > 0 && (
                <div className={classConfig.spacing[variant]}>
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

                        <div className={classConfig.spacing[variant]}>
                            {categoryIngredients.map(renderIngredient)}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
