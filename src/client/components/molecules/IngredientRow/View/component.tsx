'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { Ingredient } from '@/common/types';
import type { TypographyVariant } from '@/client/components';
import { Typography } from '@/client/components';
import { classNames } from '@/client/utils';

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
    className?: string;
    ingredient: Ingredient;
    disabled?: boolean;
    onDeselected?: (ingredient: Ingredient) => void;
    onSelected?: (ingredient: Ingredient) => void;
    selected?: boolean;
    variant?: 'desktop' | 'mobile';
}>;

export const IngredientRowView: React.FC<IngredientRowViewProps> = ({
    className,
    ingredient,
    disabled,
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
        if (disabled) return;

        const newChecked = !checked;
        setChecked(newChecked);

        if (newChecked) {
            onSelected?.(ingredient);
        } else {
            onDeselected?.(ingredient);
        }
    }, [checked, ingredient, onDeselected, onSelected, disabled]);

    useEffect(() => {
        if (checked === selected) return;
        setChecked(selected || false);

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selected]);

    return (
        <div
            className={classNames(
                'flex items-center',
                className,
                disabled ? 'cursor-default' : 'cursor-pointer'
            )}
            onClick={handleRowClick}
        >
            <div
                className={`flex items-center ${checked ? '[&>p]:text-gray-300 [&>p]:dark:text-gray-600' : ''}  w-full`}
            >
                <Typography variant={typographyVariant} className={`font-bold`}>
                    {ingredient.name}
                </Typography>
                {ingredient.quantity && ingredient.name ? (
                    <React.Fragment>
                        <Typography
                            variant={typographyVariant}
                            className={`font-bold`}
                        >
                            &nbsp;&nbsp;&nbsp;&ndash;&nbsp;&nbsp;&nbsp;
                        </Typography>
                        <Typography variant={typographyVariant}>
                            {ingredient.quantity}
                        </Typography>
                    </React.Fragment>
                ) : null}
            </div>
        </div>
    );
};
