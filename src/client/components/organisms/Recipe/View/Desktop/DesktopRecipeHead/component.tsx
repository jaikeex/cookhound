'use client';

import * as React from 'react';
import type { RecipeDTO } from '@/common/types';
import {
    Typography,
    Tooltip,
    Rating,
    RecipeInfo,
    RecipeImage,
    TagList
} from '@/client/components';
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
                            cooldownKey={recipe.displayId}
                        />
                    </Tooltip>

                    <TagList
                        tags={recipe.tags ?? []}
                        size="sm"
                        className="mt-2"
                    />
                </div>

                <RecipeInfo
                    className="mt-4"
                    portionSize={recipe.portionSize}
                    time={recipe.time}
                    verbose={true}
                    typographyVariant={'body-sm'}
                />
            </div>

            <RecipeImage
                src={recipe.imageUrl}
                alt={recipe.title}
                className="max-h-[180px] max-w-80"
            />
        </div>
    );
};
