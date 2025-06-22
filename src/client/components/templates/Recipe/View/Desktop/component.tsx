'use client';

import React from 'react';
import type { RecipeDTO } from '@/common/types/recipe';
import {
    ButtonBase,
    Divider,
    IngredientsListView,
    InstructionsView,
    Rating,
    RecipeInfo,
    Tooltip,
    Typography
} from '@/client/components';
import Image from 'next/image';
import { generateImgPlaceholder } from '@/client/utils';
import { useAuth, useLocale } from '@/client/store';
import { useDisplayRecipe } from '@/client/components/templates/Recipe/View/useDisplayRecipe';

export type DesktopRecipeViewProps = Readonly<{
    className?: string;
    isPreview?: boolean;
    recipe: RecipeDTO;
    ref?: React.RefObject<HTMLDivElement> | null;
}>;

export const DesktopRecipeViewTemplate: React.FC<DesktopRecipeViewProps> = ({
    className,
    isPreview,
    recipe,
    ref
}) => {
    const { t } = useLocale();
    const { user } = useAuth();

    const { rateRecipe } = useDisplayRecipe(recipe);

    return (
        <div
            className={`max-w-screen-md px-4 mx-auto 3xl:max-w-screen-lg ${className}`}
            ref={ref}
        >
            <div className={'space-y-4'}>
                <div className={'flex justify-between gap-12'}>
                    <div
                        className={
                            'flex flex-col items-start justify-between w-full'
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
                                    onClick={rateRecipe}
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
                            className={
                                'object-cover w-full h-48 rounded-md max-w-80'
                            }
                            width={320}
                            height={192}
                            placeholder={'blur'}
                            blurDataURL={generateImgPlaceholder(80, 80, 80)}
                        />
                    ) : (
                        <div className={'w-full h-48 rounded-md max-w-80'} />
                    )}
                </div>

                <Divider />

                <div className={'flex gap-12'}>
                    <div className={'w-[35%]'}>
                        <Typography variant={'heading-sm'}>
                            {t('app.recipe.ingredients')}
                        </Typography>
                        <IngredientsListView
                            key={`${recipe.id}-ingredients-list-view-desktop`}
                            ingredients={recipe.ingredients}
                            className={'mt-4'}
                            variant={'desktop'}
                        />

                        <ButtonBase color="secondary" className={'w-full mt-8'}>
                            <Typography
                                variant={'body'}
                                className={'text-center'}
                            >
                                {t('app.recipe.create-shopping-list')}
                            </Typography>
                        </ButtonBase>
                    </div>

                    <div className={'space-y-2 w-[65%]'}>
                        <Typography variant={'heading-sm'}>
                            {t('app.recipe.instructions')}
                        </Typography>
                        <InstructionsView recipe={recipe} variant={'desktop'} />

                        {recipe.notes ? (
                            <React.Fragment>
                                <Divider dashed={true} className={'!mt-8'} />
                                <div className={'w-full space-y-2'}>
                                    <Typography variant={'heading-sm'}>
                                        {t('app.recipe.notes')}
                                    </Typography>
                                    <Typography variant={'body-sm'}>
                                        {recipe.notes}
                                    </Typography>
                                </div>
                            </React.Fragment>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};
