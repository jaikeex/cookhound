'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { Ingredient } from '@/common/types';
import { Icon } from '@/client/components/atoms/Icons';
import {
    Typography,
    type TypographyVariant
} from '@/client/components/atoms/Typography';
import { classNames } from '@/client/utils';

//~---------------------------------------------------------------------------------------------~//
//$                                           OPTIONS                                           $//
//~---------------------------------------------------------------------------------------------~//

const classConfig = {
    typography: {
        'desktop': 'body-sm',
        'mobile': 'body',
        'responsive': 'body'
    },

    typographyOverride: {
        'desktop': '',
        'mobile': '',
        'responsive': '@recipe:text-sm'
    }
};
//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export type IngredientRowViewProps = Readonly<{
    className?: string;
    disabled?: boolean;
    ingredient: Ingredient;
    onDeselected?: (ingredient: Ingredient) => void;
    onSelected?: (ingredient: Ingredient) => void;
    selected?: boolean;
    variant?: 'desktop' | 'mobile' | 'responsive';
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

    const typographyOverride = classConfig.typographyOverride[variant];

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
                <Typography
                    variant={typographyVariant}
                    className={classNames(
                        'font-bold w-fit',
                        typographyOverride
                    )}
                >
                    {ingredient.name}
                </Typography>
                {ingredient.quantity && ingredient.name ? (
                    <React.Fragment>
                        <Typography
                            variant={typographyVariant}
                            className={classNames(
                                'font-bold align-middle mx-2',
                                typographyOverride
                            )}
                        >
                            &ndash;
                        </Typography>
                        <Typography
                            variant={typographyVariant}
                            className={typographyOverride}
                        >
                            {ingredient.quantity}
                        </Typography>
                    </React.Fragment>
                ) : null}

                {checked ? (
                    <Icon
                        name="checkmark"
                        size={20}
                        className={`ml-auto mr-px text-green-500 dark:text-green-500 opacity-80 dark:opacity-70`}
                    />
                ) : null}
            </div>
        </div>
    );
};
