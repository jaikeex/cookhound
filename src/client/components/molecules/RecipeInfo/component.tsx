'use client';

import React from 'react';
import type { TypographyVariant } from '@/client/components';
import { Icon, Typography } from '@/client/components';
import { useLocale } from '@/client/store';
import { classNames } from '@/client/utils';

type RecipeInfoSize = 'sm' | 'md';

const classConfig = {
    iconSize: {
        sm: 16,
        md: 24
    },
    gap: {
        sm: 'gap-2',
        md: 'gap-6'
    },
    innerGap: {
        sm: 'gap-1',
        md: 'gap-2'
    }
};

type RecipeInfoProps = Readonly<{
    className?: string;
    portionSize?: number | null;
    time?: number | null;
    typographyVariant?: TypographyVariant;
    verbose?: boolean;
    size?: RecipeInfoSize;
}>;

export const RecipeInfo: React.FC<RecipeInfoProps> = ({
    className,
    portionSize,
    time,
    typographyVariant = 'body-sm',
    verbose,
    size = 'md'
}) => {
    const { t } = useLocale();

    return (
        <div
            className={classNames(
                'flex items-center',
                classConfig.gap[size],
                className
            )}
        >
            {portionSize ? (
                <div
                    className={`flex items-center ${classConfig.innerGap[size]}`}
                >
                    <Icon name={'servings'} size={classConfig.iconSize[size]} />
                    <Typography variant={typographyVariant} disableLinkStyles>
                        {verbose ? `${t('app.recipe.servings')}: ` : null}
                        {portionSize}
                    </Typography>
                </div>
            ) : null}
            {time ? (
                <div
                    className={`flex items-center ${classConfig.innerGap[size]}`}
                >
                    <Icon name={'time'} size={classConfig.iconSize[size]} />
                    <Typography variant={typographyVariant} disableLinkStyles>
                        {verbose
                            ? `${t('app.recipe.preparation-time')}: `
                            : null}
                        {time}
                        {verbose ? null : ` ${t('app.recipe.minutes-short')}`}
                    </Typography>
                </div>
            ) : null}
        </div>
    );
};
