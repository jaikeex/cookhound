'use client';

import * as React from 'react';
import type { RecipeDTO } from '@/common/types';
import {
    Rating,
    Tooltip,
    Typography,
    RecipeInfo,
    RecipeViewImage,
    TagList
} from '@/client/components';
import { useAuth, useLocale, useRecipeHandling } from '@/client/store';
import { classNames } from '@/client/utils';

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

            <Typography variant={'heading-xl'} className={'text-center'}>
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
