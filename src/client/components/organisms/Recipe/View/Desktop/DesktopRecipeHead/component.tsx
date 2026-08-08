'use client';

import * as React from 'react';
import type { Recipe } from '@/common/types';
import { Typography } from '@/client/components/atoms/Typography';
import { Tooltip } from '@/client/components/atoms/Tooltip';
import { Rating } from '@/client/components/molecules/Rating';
import { RecipeInfo } from '@/client/components/molecules/RecipeInfo';
import { RecipeViewImage } from '@/client/components/molecules/Image/RecipeView';
import { TagList } from '@/client/components/molecules/Tag/Display/List';
import { RecipeAuthorLinkDesktop } from '@/client/components/molecules/RecipeAuthorLink/Desktop';
import { useAuth, useRecipeHandling } from '@/client/store';
import { t } from '@/client/locales';

export type DesktopRecipeHeadProps = Readonly<{
    isPreview?: boolean;
    onRateRecipe?: (rating: number) => void;
    recipe: Recipe;
}>;

export const DesktopRecipeHead: React.FC<DesktopRecipeHeadProps> = ({
    isPreview,
    onRateRecipe,
    recipe
}) => {
    const { user } = useAuth();

    const { incrementPortionSize, decrementPortionSize, portionSize } =
        useRecipeHandling();

    return (
        <div className={'flex justify-between gap-12'}>
            <div
                className={
                    'flex flex-col items-start justify-between w-full gap-2'
                }
            >
                <div className={'flex flex-col w-full gap-2'}>
                    <Typography as="h1" variant={'heading-xl'}>
                        {recipe.title}
                    </Typography>

                    <div className="flex items-center justify-between gap-8 mt-2">
                        {isPreview ? null : (
                            <RecipeAuthorLinkDesktop
                                authorId={recipe.authorId}
                                createdAt={recipe.createdAt}
                            />
                        )}

                        <div className="flex items-center gap-3">
                            <Tooltip
                                className={'w-fit'}
                                disabled={isPreview || !!user}
                                position={'bottom'}
                                text={t('app.general.anonymous')}
                            >
                                <Rating
                                    cooldown={60000}
                                    cooldownKey={recipe.displayId}
                                    disabled={isPreview || !user}
                                    fill={'gold'}
                                    iconSize={22}
                                    onClick={onRateRecipe}
                                    rating={recipe.rating}
                                />
                            </Tooltip>
                        </div>
                    </div>

                    <TagList
                        className="mt-2"
                        linkToHubs={!isPreview}
                        size="sm"
                        tags={recipe.tags ?? []}
                    />
                </div>

                <RecipeInfo
                    className="mt-4"
                    time={recipe.time}
                    disablePortionSize={isPreview}
                    portionSize={portionSize}
                    onDecrementPortionSize={decrementPortionSize}
                    onIncrementPortionSize={incrementPortionSize}
                    typographyVariant={'body-sm'}
                    verbose={true}
                />
            </div>

            <RecipeViewImage
                wrapperClassName="w-80 shrink-0"
                recipe={recipe}
                priority={true}
                isPreview={isPreview}
            />
        </div>
    );
};
