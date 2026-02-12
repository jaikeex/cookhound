'use client';

import React from 'react';
import {
    Icon,
    Stepper,
    Typography,
    type TypographyVariant
} from '@/client/components';
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
    disablePortionSize?: boolean;
    layout?: 'vertical' | 'horizontal';
    portionSize?: number | null;
    onDecrementPortionSize?: () => void;
    onIncrementPortionSize?: () => void;
    size?: RecipeInfoSize;
    time?: number | null;
    typographyVariant?: TypographyVariant;
    verbose?: boolean;
}>;

export const RecipeInfo: React.FC<RecipeInfoProps> = ({
    className,
    disablePortionSize = false,
    layout = 'horizontal',
    portionSize,
    onDecrementPortionSize,
    onIncrementPortionSize,
    size = 'md',
    time,
    typographyVariant = 'body-sm',
    verbose
}) => {
    const { t } = useLocale();

    return (
        <div
            className={classNames(
                `flex ${layout === 'vertical' ? 'flex-col items-start' : 'items-center'}`,
                classConfig.gap[size],
                className
            )}
        >
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

            {portionSize ? (
                <div
                    className={`flex items-center ${classConfig.innerGap[size]}`}
                >
                    <Icon name={'servings'} size={classConfig.iconSize[size]} />
                    <Typography variant={typographyVariant} disableLinkStyles>
                        {verbose ? `${t('app.recipe.servings')}: ` : null}
                        {portionSize}
                    </Typography>

                    {disablePortionSize ? null : (
                        <Stepper
                            onUp={onIncrementPortionSize}
                            onDown={onDecrementPortionSize}
                        />
                    )}
                </div>
            ) : null}
        </div>
    );
};
