'use client';

import * as React from 'react';
import type { RecipeDTO } from '@/common/types';
import {
    Rating,
    Tooltip,
    Typography,
    RecipeInfo,
    TagList
} from '@/client/components';
import { useAuth, useLocale } from '@/client/store';
import { classNames } from '@/client/utils';
import { RecipeViewImage } from '@/client/components/molecules/Image/RecipeView/component';

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
            <RecipeViewImage
                src={recipe.imageUrl}
                alt={recipe.title}
                recipeId={recipe.id}
                wrapperClassName={'mx-auto max-w-[480px]'}
                className={'min-w-auto max-w-auto'}
                priority={true}
                authorId={recipe.authorId}
                createdAt={recipe.createdAt}
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
