'use client';

import * as React from 'react';
import type { RecipeDTO } from '@/common/types';
import {
    Typography,
    Tooltip,
    Rating,
    RecipeInfo,
    RecipeViewImage,
    TagList
} from '@/client/components';
import { RecipeAuthorLinkDesktop } from '@/client/components';
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
            <div
                className={
                    'flex flex-col items-start justify-between w-full gap-2'
                }
            >
                <div className={'flex flex-col w-full gap-2'}>
                    <Typography variant={'heading-xl'}>
                        {recipe.title}
                    </Typography>

                    <div className="flex items-center justify-between gap-8 mt-2">
                        {isPreview ? null : (
                            <RecipeAuthorLinkDesktop
                                authorId={recipe.authorId}
                                createdAt={recipe.createdAt}
                            />
                        )}

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

                    <TagList
                        className="mt-2"
                        size="sm"
                        tags={recipe.tags ?? []}
                    />
                </div>

                <RecipeInfo
                    className="mt-4"
                    portionSize={recipe.portionSize}
                    time={recipe.time}
                    typographyVariant={'body-sm'}
                    verbose={true}
                />
            </div>

            <RecipeViewImage
                alt={recipe.title}
                className="max-h-[180px] max-w-80"
                src={recipe.imageUrl}
                recipeId={recipe.id}
                priority={true}
                authorId={recipe.authorId}
                createdAt={recipe.createdAt}
                isPreview={isPreview}
            />
        </div>
    );
};
