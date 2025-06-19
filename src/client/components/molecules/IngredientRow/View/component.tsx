'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { Ingredient } from '@/common/types';
import type { TypographyVariant } from '@/client/components';
import { Checkbox, Typography } from '@/client/components';

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
        if (variant === 'desktop') return;
        setChecked((prev) => !prev);
    }, [variant]);

    const handleCheckboxClick = useCallback(() => {
        if (variant === 'mobile') return;
        setChecked((prev) => !prev);
    }, [variant]);

    useEffect(
        () => (checked ? onSelected?.(ingredient) : onDeselected?.(ingredient)),
        [checked, ingredient, onDeselected, onSelected]
    );

    useEffect(() => {
        setChecked(selected || false);
    }, [selected]);

    return (
        <div className={`flex items-center`} onClick={handleRowClick}>
            {/* DESKTOP view has the checkbox on the left side */}
            {/* ---------------------------------------------- */}

            {variant === 'desktop' ? (
                <Checkbox
                    className={`mr-4`}
                    color={'secondary'}
                    checked={checked}
                    size={'sm'}
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={handleCheckboxClick}
                />
            ) : null}

            {/* ---------------------------------------------- */}

            <div
                className={`flex items-center ${checked ? '[&>p]:text-gray-500' : ''} justify-between w-full`}
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
            {/* MOBILE view has the checkbox on the right side */}
            {/* ---------------------------------------------- */}
            {variant === 'mobile' ? (
                <Checkbox
                    className={`ml-3`}
                    color={'secondary'}
                    checked={checked}
                    // eslint-disable-next-line @typescript-eslint/no-empty-function
                    // eslint-disable-next-line react/jsx-no-bind
                    onChange={handleCheckboxClick}
                />
            ) : null}

            {/* ---------------------------------------------- */}
        </div>
    );
};
