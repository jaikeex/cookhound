'use client';

import React from 'react';
import type { TypographyVariant } from '@/client/components';
import { Icon, Typography } from '@/client/components';
import { useLocale } from '@/client/store';

type RecipeInfoProps = Readonly<{
    portionSize?: number | null;
    time?: number | null;
    typographyVariant?: TypographyVariant;
    verbose?: boolean;
}>;

export const RecipeInfo: React.FC<RecipeInfoProps> = ({
    portionSize,
    time,
    typographyVariant,
    verbose
}) => {
    const { t } = useLocale();

    return (
        <div className={'flex items-center gap-6'}>
            {portionSize ? (
                <div className={'flex items-center gap-2'}>
                    <Icon name={'servings'} size={24} />
                    <Typography variant={typographyVariant}>
                        {verbose ? `${t('app.recipe.servings')}: ` : null}
                        {portionSize}
                    </Typography>
                </div>
            ) : null}
            {time ? (
                <div className={'flex items-center gap-2'}>
                    <Icon name={'time'} size={24} />
                    <Typography variant={typographyVariant}>
                        {verbose
                            ? `${t('app.recipe.preparation-time')}: `
                            : null}
                        {time}
                    </Typography>
                </div>
            ) : null}
        </div>
    );
};
