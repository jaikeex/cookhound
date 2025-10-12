'use client';

import { Typography } from '@/client/components';
import { DraggableIngredientRow } from '@/client/components';
import { DraggableList } from '@/client/components';
import type { ShoppingListIngredientDTO } from '@/common/types';
import type { PanInfo } from 'framer-motion';
import * as React from 'react';
import { classNames } from '@/client/utils';
import { useLocale } from '@/client/store';
import { Divider } from '@/client/components';

type TrashProps = Readonly<{
    className?: string;
    ingredients: ShoppingListIngredientDTO[];
    onReorder: (values: number[]) => void;
    onDragEnd: (
        ingredient: ShoppingListIngredientDTO,
        recipeId: number
    ) => (event: PointerEvent, info: PanInfo) => void;
    ref?: React.RefObject<HTMLDivElement | null>;
}>;

export const Trash: React.FC<TrashProps> = ({
    className,
    ingredients,
    onReorder,
    onDragEnd,
    ref
}) => {
    const { t } = useLocale();

    return (
        <div
            ref={ref}
            className={classNames(
                'p-4 mt-10 border-2 border-red-600 border-dashed rounded-lg min-h-32',
                className
            )}
        >
            <Typography variant="body" className="text-center">
                {t('app.shopping-list.trash')}
            </Typography>

            <Typography
                variant="label"
                className="text-center text-gray-600 dark:text-gray-400"
            >
                {t('app.shopping-list.trash-description')}
            </Typography>

            {ingredients.length === 0 ? null : <Divider className="my-2" />}

            <DraggableList
                className="mt-4"
                values={ingredients.map((i) => i.id)}
                onReorder={onReorder}
            >
                {ingredients.map((ingredient) => (
                    <DraggableIngredientRow
                        key={ingredient.id}
                        ingredient={ingredient}
                        dragIndex={ingredient.id}
                        onDragEnd={onDragEnd(ingredient, ingredient.recipeId)}
                    />
                ))}
            </DraggableList>
        </div>
    );
};
