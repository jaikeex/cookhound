'use client';

import React, { forwardRef } from 'react';
import { Divider, Typography, Tooltip, IconButton } from '@/client/components';
import {
    RecipeInfo,
    DraggableIngredientRow,
    IngredientRowView
} from '@/client/components/molecules';
import Link from 'next/link';
import type { Ingredient, ShoppingListDTO } from '@/common/types';
import type { PanInfo } from 'framer-motion';
import { useLocale } from '@/client/store';
import { DraggableList } from '@/client/components';

type ShoppingListBodyProps = Readonly<{
    editing?: boolean;
    list: ShoppingListDTO;
    onMark: (ingredient: Ingredient) => Promise<void>;
    onUnMark: (ingredient: Ingredient) => Promise<void>;
    onDelete: () => void;
    onReorder: (values: number[]) => void;
    onIngredientDragEnd: (
        ingredient: ShoppingListDTO['ingredients'][number]
    ) => (event: PointerEvent, info?: PanInfo) => void;
}> &
    React.RefAttributes<HTMLDivElement>;

export const ShoppingListBody = forwardRef<
    HTMLDivElement,
    ShoppingListBodyProps
>(
    (
        {
            list,
            editing,
            onDelete,
            onReorder,
            onIngredientDragEnd,
            onMark,
            onUnMark
        },
        ref
    ) => {
        const { t } = useLocale();

        return (
            <div key={list.recipe.displayId} className="mt-4" ref={ref}>
                <Divider className="mb-4" />

                <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <Link href={`/recipe/${list.recipe.displayId}`}>
                            <Typography variant="heading-xs">
                                {list.recipe.title}
                            </Typography>
                        </Link>

                        <Tooltip
                            text={t('app.shopping-list.portion-size-tooltip', {
                                portionSize: list.recipe.portionSize ?? 0
                            })}
                        >
                            <RecipeInfo
                                portionSize={list.recipe.portionSize}
                                verbose={false}
                                typographyVariant={'body'}
                            />
                        </Tooltip>
                    </div>

                    {!editing ? (
                        <IconButton
                            onClick={onDelete}
                            icon="cancel"
                            iconClassName="fill-red-500"
                        />
                    ) : null}
                </div>

                {editing ? (
                    <DraggableList
                        className="mt-6"
                        values={list.ingredients.map((i) => i.id)}
                        onReorder={onReorder}
                    >
                        {list.ingredients.map((ingredient) => (
                            <DraggableIngredientRow
                                ingredient={ingredient}
                                dragIndex={ingredient.id}
                                key={ingredient.id}
                                onDragEnd={onIngredientDragEnd(ingredient)}
                            />
                        ))}
                    </DraggableList>
                ) : (
                    <div className="mt-6 space-y-3">
                        {list.ingredients.map((ingredient) => (
                            <IngredientRowView
                                disabled={editing}
                                ingredient={ingredient}
                                key={ingredient.id}
                                variant={'mobile'}
                                onDeselected={onUnMark}
                                onSelected={onMark}
                                selected={ingredient.marked}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }
);
