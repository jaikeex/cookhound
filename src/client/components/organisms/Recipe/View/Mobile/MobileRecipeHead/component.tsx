'use client';

import * as React from 'react';
import type { RecipeDTO } from '@/common/types';
import {
    Rating,
    Tooltip,
    Typography,
    RecipeInfo,
    RecipeImage
} from '@/client/components';
import { useAuth, useLocale } from '@/client/store';
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

    return (
        <React.Fragment>
            <RecipeImage
                src={recipe.imageUrl}
                alt={recipe.title}
                className={'mx-auto max-w-[480px]'}
            />
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
                    portionSize={recipe.portionSize}
                    time={recipe.time}
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
                        cooldownKey={recipe.displayId}
                    />
                </Tooltip>
            </div>
        </React.Fragment>
    );
};
