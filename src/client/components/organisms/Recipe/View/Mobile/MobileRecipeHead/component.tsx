'use client';

import * as React from 'react';
import type { Recipe } from '@/common/types';
import { Rating } from '@/client/components/molecules/Rating';
import { Tooltip } from '@/client/components/atoms/Tooltip';
import { Typography } from '@/client/components/atoms/Typography';
import { RecipeInfo } from '@/client/components/molecules/RecipeInfo';
import { RecipeViewImage } from '@/client/components/molecules/Image/RecipeView';
import { TagList } from '@/client/components/molecules/Tag/Display/List';
import { useAuth, useRecipeHandling } from '@/client/store';
import { classNames } from '@/client/utils';
import { t } from '@/client/locales';

export type MobileRecipeHeadProps = Readonly<{
    isPreview?: boolean;
    onRateRecipe?: (rating: number) => void;
    recipe: Recipe;
}>;

export const MobileRecipeHead: React.FC<MobileRecipeHeadProps> = ({
    isPreview,
    onRateRecipe,
    recipe
}) => {
    const { user } = useAuth();

    const { incrementPortionSize, decrementPortionSize, portionSize } =
        useRecipeHandling();

    return (
        <React.Fragment>
            <RecipeViewImage
                recipe={recipe}
                wrapperClassName={'mx-auto max-w-[480px]'}
                className={'min-w-auto max-w-auto'}
                priority={true}
                isPreview={isPreview}
            />

            <Typography
                as="h1"
                variant={'heading-xl'}
                className={'text-center'}
            >
                {recipe.title}
            </Typography>

            <TagList
                tags={recipe.tags ?? []}
                size="xs"
                className="justify-center mt-2"
            />

            <div
                className={classNames(
                    'flex items-center justify-center',
                    (recipe?.portionSize || recipe?.time) &&
                        'gap-4 justify-between'
                )}
            >
                <RecipeInfo
                    time={recipe.time}
                    disablePortionSize={isPreview}
                    portionSize={portionSize}
                    onDecrementPortionSize={decrementPortionSize}
                    onIncrementPortionSize={incrementPortionSize}
                    verbose={false}
                    typographyVariant={'body'}
                />

                <div className="flex items-center gap-3">
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
                            cooldownKey={recipe.displayId}
                        />
                    </Tooltip>
                </div>
            </div>
        </React.Fragment>
    );
};
