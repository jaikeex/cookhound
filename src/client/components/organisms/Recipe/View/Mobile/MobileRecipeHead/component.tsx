'use client';

import * as React from 'react';
import type { RecipeDTO } from '@/common/types';
import { generateImgPlaceholder } from '@/client/utils';
import { Rating, Tooltip, Typography, RecipeInfo } from '@/client/components';
import Image from 'next/image';
import { useAuth, useLocale } from '@/client/store';
import classNames from 'classnames';

export type MobileRecipeHeadProps = Readonly<{
    isPreview?: boolean;
    onRateRecipe?: (rating: number) => void;
    recipe: RecipeDTO;
}>;

export const MobileRecipeHead: React.FC<MobileRecipeHeadProps> = ({
    isPreview,
    onRateRecipe,
    recipe
}) => {
    const { t } = useLocale();
    const { user } = useAuth();

    return (
        <React.Fragment>
            {recipe.imageUrl ? (
                <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className={
                        'object-cover w-full mx-auto rounded-md max-w-[480px] xl:max-w-full aspect-[16/9]'
                    }
                    width={320}
                    height={192}
                    placeholder={'blur'}
                    blurDataURL={generateImgPlaceholder(80, 80, 80)}
                />
            ) : null}
            <Typography variant={'heading-xl'} className={'text-center'}>
                {recipe.title}
            </Typography>
            <div
                className={classNames(
                    'flex items-center justify-center',
                    (recipe?.portionSize || recipe?.time) &&
                        'gap-4 justify-between'
                )}
            >
                <RecipeInfo
                    recipe={recipe}
                    verbose={false}
                    typographyVariant={'body'}
                />

                <Tooltip
                    position={'top'}
                    text={t('app.general.anonymous')}
                    disabled={isPreview || !!user}
                >
                    <Rating
                        onClick={onRateRecipe}
                        disabled={isPreview || !user}
                        rating={recipe.rating}
                        fill={'gold'}
                        iconSize={22}
                        cooldown={60000}
                    />
                </Tooltip>
            </div>
        </React.Fragment>
    );
};
