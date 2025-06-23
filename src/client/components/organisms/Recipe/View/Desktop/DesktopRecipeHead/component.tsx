'use client';

import * as React from 'react';
import type { RecipeDTO } from '@/common/types';
import { generateImgPlaceholder } from '@/client/utils';
import { Typography, Tooltip, Rating, RecipeInfo } from '@/client/components';
import Image from 'next/image';
import { useAuth, useLocale } from '@/client/store';

export type DesktopRecipeHeadProps = Readonly<{
    isPreview?: boolean;
    onRateRecipe?: (rating: number) => void;
    recipe: RecipeDTO;
}>;

export const DesktopRecipeHead: React.FC<DesktopRecipeHeadProps> = ({
    isPreview,
    onRateRecipe,
    recipe
}) => {
    const { t } = useLocale();
    const { user } = useAuth();

    return (
        <div className={'flex justify-between gap-12'}>
            <div className={'flex flex-col items-start justify-between w-full'}>
                <div className={'flex flex-col w-full gap-2'}>
                    <Typography variant={'heading-xl'}>
                        {recipe.title}
                    </Typography>

                    <Tooltip
                        position={'bottom'}
                        text={t('app.general.anonymous')}
                        disabled={isPreview || !!user}
                        className={'w-fit'}
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

                <RecipeInfo
                    recipe={recipe}
                    verbose={true}
                    typographyVariant={'body-sm'}
                />
            </div>

            {recipe.imageUrl ? (
                <Image
                    src={recipe.imageUrl}
                    alt={recipe.title}
                    className={'object-cover w-full h-48 rounded-md max-w-80'}
                    width={320}
                    height={192}
                    placeholder={'blur'}
                    blurDataURL={generateImgPlaceholder(80, 80, 80)}
                />
            ) : (
                <div className={'w-full h-48 rounded-md max-w-80'} />
            )}
        </div>
    );
};
