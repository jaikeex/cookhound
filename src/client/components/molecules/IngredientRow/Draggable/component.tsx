'use client';

import React from 'react';
import type { Ingredient } from '@/common/types';
import { IngredientRowView } from '@/client/components/molecules/IngredientRow/View';
import { DraggableInputRow } from '@/client/components';
import type { PanInfo } from 'framer-motion';
import { classNames } from '@/client/utils';

type DraggableIngredientRowProps = Readonly<{
    className?: string;
    dragIndex: number;
    ingredient: Ingredient;
    onDragEnd?: (event: PointerEvent, info: PanInfo) => void;
}>;

export const DraggableIngredientRow: React.FC<DraggableIngredientRowProps> = ({
    ingredient,
    dragIndex,
    className,
    onDragEnd
}) => {
    return (
        <DraggableInputRow
            index={dragIndex}
            className={classNames(
                'flex items-center justify-between',
                className
            )}
            disableRemove={true}
            onDragEnd={onDragEnd}
        >
            <IngredientRowView
                className={classNames('w-full mr-2', className)}
                ingredient={ingredient}
                disabled
                variant="mobile"
            />
        </DraggableInputRow>
    );
};
