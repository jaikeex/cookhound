'use client';

import React from 'react';
import type { TypographyVariant } from '@/client/components';
import { Icon, Typography } from '@/client/components';
import type { Recipe } from '@/client/types';
import { useLocale } from '@/client/store';

type RecipeInfoProps = Readonly<{
    recipe: Recipe;
    typographyVariant?: TypographyVariant;
    verbose?: boolean;
}>;

export const RecipeInfo: React.FC<RecipeInfoProps> = ({
    recipe,
    typographyVariant,
    verbose
}) => {
    const { t } = useLocale();

    return (
        <div className={'flex items-center gap-8'}>
            {recipe.portion_size ? (
                <div className={'flex items-center gap-2'}>
                    <Icon name={'servings'} size={24} />
                    <Typography variant={typographyVariant}>
                        {verbose ? `${t('app.recipe.servings')}: ` : null}
                        {recipe.portion_size}
                    </Typography>
                </div>
            ) : null}
            {recipe.time ? (
                <div className={'flex items-center gap-2'}>
                    <Icon name={'time'} size={24} />
                    <Typography variant={typographyVariant}>
                        {verbose
                            ? `${t('app.recipe.preparation-time')}: `
                            : null}
                        {recipe.time}
                    </Typography>
                </div>
            ) : null}
        </div>
    );
};
