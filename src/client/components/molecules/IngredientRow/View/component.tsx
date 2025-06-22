'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { Ingredient } from '@/common/types';
import type { TypographyVariant } from '@/client/components';
import { Typography } from '@/client/components';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const classConfig = {
    typography: {
        'desktop': 'body-sm',
        'mobile': 'body'
    }
};
//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export type IngredientRowViewProps = Readonly<{
    ingredient: Ingredient;
    onDeselected?: (ingredient: Ingredient) => void;
    onSelected?: (ingredient: Ingredient) => void;
    selected?: boolean;
    variant?: 'desktop' | 'mobile';
}>;

export const IngredientRowView: React.FC<IngredientRowViewProps> = ({
    ingredient,
    onDeselected,
    onSelected,
    selected,
    variant = 'desktop'
}) => {
    const typographyVariant = classConfig.typography[
        variant
    ] as TypographyVariant;

    const [checked, setChecked] = useState<boolean>(selected || false);

    const handleRowClick = useCallback(() => {
        setChecked((prev) => !prev);
    }, []);

    useEffect(
        () => (checked ? onSelected?.(ingredient) : onDeselected?.(ingredient)),
        [checked, ingredient, onDeselected, onSelected]
    );

    useEffect(() => {
        setChecked(selected || false);
    }, [selected]);

    return (
        <div
            className={`flex items-center cursor-pointer`}
            onClick={handleRowClick}
        >
            <div
                className={`flex items-center ${checked ? '[&>p]:text-gray-300 [&>p]:dark:text-gray-600' : ''} justify-between w-full`}
            >
                <Typography variant={typographyVariant}>
                    {ingredient.name}
                </Typography>
                {ingredient.quantity && ingredient.name ? (
                    <React.Fragment>
                        <Typography
                            variant={typographyVariant}
                            className={`font-bold`}
                        >
                            {ingredient.quantity}
                        </Typography>
                    </React.Fragment>
                ) : null}
            </div>
        </div>
    );
};
