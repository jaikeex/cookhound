'use client';

import React from 'react';
import { Icon } from '@/client/components/atoms/Icons';
import { Stepper } from '@/client/components/atoms/Stepper';
import {
    Typography,
    type TypographyVariant
} from '@/client/components/atoms/Typography';
import { classNames } from '@/client/utils';
import { t } from '@/client/locales';

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
    },
    strip: {
        container: 'grid grid-flow-col auto-cols-fr',
        item: 'justify-center px-2 pt-2',
        containerReset: '@recipe:flex',
        itemReset: '@recipe:justify-start @recipe:p-0',
        gapReset: {
            sm: '@recipe:gap-2',
            md: '@recipe:gap-6'
        }
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
    strip?: boolean | 'responsive';
    time?: number | null;
    typographyVariant?: TypographyVariant;
    verbose?: boolean | 'responsive';
}>;

export const RecipeInfo: React.FC<RecipeInfoProps> = ({
    className,
    disablePortionSize = false,
    layout = 'horizontal',
    portionSize,
    onDecrementPortionSize,
    onIncrementPortionSize,
    size = 'md',
    strip = false,
    time,
    typographyVariant = 'body-sm',
    verbose
}) => {
    const isResponsiveStrip = strip === 'responsive';

    const itemClassName = classNames(
        'flex items-center',
        classConfig.innerGap[size],
        strip && classConfig.strip.item,
        isResponsiveStrip && classConfig.strip.itemReset
    );

    return (
        <div
            className={classNames(
                strip ? classConfig.strip.container : 'flex',
                layout === 'vertical' ? 'flex-col items-start' : 'items-center',
                strip ? null : classConfig.gap[size],
                isResponsiveStrip && [
                    classConfig.strip.containerReset,
                    classConfig.strip.gapReset[size]
                ],
                className
            )}
        >
            {time ? (
                <div className={itemClassName}>
                    <Icon name={'time'} size={classConfig.iconSize[size]} />
                    <Typography
                        variant={typographyVariant}
                        disableLinkStyles
                        className={
                            verbose === 'responsive'
                                ? '@recipe:text-sm'
                                : undefined
                        }
                    >
                        {verbose === 'responsive' ? (
                            <span className={'hidden @recipe:inline'}>
                                {t('app.recipe.preparation-time')}:{' '}
                            </span>
                        ) : verbose ? (
                            `${t('app.recipe.preparation-time')}: `
                        ) : null}
                        {time}
                        {verbose === 'responsive' ? (
                            <React.Fragment>
                                <span className={'@recipe:hidden'}>
                                    {' '}
                                    {t('app.recipe.minutes-short')}
                                </span>
                                <span className={'hidden @recipe:inline'}>
                                    {' '}
                                    {t('app.recipe.minutes')}
                                </span>
                            </React.Fragment>
                        ) : verbose ? (
                            ` ${t('app.recipe.minutes')}`
                        ) : (
                            ` ${t('app.recipe.minutes-short')}`
                        )}
                    </Typography>
                </div>
            ) : null}

            {portionSize ? (
                <div className={itemClassName}>
                    <Icon name={'servings'} size={classConfig.iconSize[size]} />
                    <Typography
                        variant={typographyVariant}
                        disableLinkStyles
                        className={
                            verbose === 'responsive'
                                ? '@recipe:text-sm'
                                : undefined
                        }
                    >
                        {verbose === 'responsive' ? (
                            <span className={'hidden @recipe:inline'}>
                                {t('app.recipe.servings')}:{' '}
                            </span>
                        ) : verbose ? (
                            `${t('app.recipe.servings')}: `
                        ) : null}
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
