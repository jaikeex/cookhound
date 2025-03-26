'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { Ingredient } from '@/client/types';
import type { TypographyVariant } from '@/client/components';
import { Checkbox, Typography } from '@/client/components';

// ---------------------------------- config ----------------------------------
//                                    region

const classConfig = {
    typography: {
        'desktop': 'body-sm',
        'mobile': 'body'
    }
};

//                                  endregion
// ----------------------------------------------------------------------------

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
        <div
            className={`flex items-center  ${checked ? '[&>p]:text-gray-500' : ''}`}
            onClick={handleRowClick}
        >
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

            <Typography variant={typographyVariant} className={`font-bold`}>
                {ingredient.quantity}&#160;
            </Typography>
            <Typography variant={typographyVariant} className={'ml-3'}>
                &#8208;
            </Typography>
            <Typography variant={typographyVariant} className={'ml-3'}>
                {ingredient.name}
            </Typography>

            {/* MOBILE view has the checkbox on the right side */}
            {/* ---------------------------------------------- */}
            {variant === 'mobile' ? (
                <Checkbox
                    className={`ml-auto`}
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
