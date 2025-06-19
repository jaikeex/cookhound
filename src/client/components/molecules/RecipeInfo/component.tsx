'use client';

import React from 'react';
import type { TypographyVariant } from '@/client/components';
import { Icon, Typography } from '@/client/components';
import type { RecipeDTO } from '@/common/types';
import { useLocale } from '@/client/store';

type RecipeInfoProps = Readonly<{
    recipe: RecipeDTO;
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
        <div className={'flex items-center gap-6'}>
            {recipe.portionSize ? (
                <div className={'flex items-center gap-2'}>
                    <Icon name={'servings'} size={24} />
                    <Typography variant={typographyVariant}>
                        {verbose ? `${t('app.recipe.servings')}: ` : null}
                        {recipe.portionSize}
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
