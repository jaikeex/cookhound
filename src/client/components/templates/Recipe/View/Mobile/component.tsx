'use client';

import React from 'react';
import type { RecipeDTO } from '@/common/types/recipe';
import {
    Divider,
    IngredientsListView,
    InstructionsView,
    Rating,
    RecipeInfo,
    Tabs,
    Typography
} from '@/client/components';
import Image from 'next/image';
import { generateImgPlaceholder } from '@/client/utils';
import { useLocale } from '@/client/store';
import classNames from 'classnames';
import { useDisplayRecipe } from '@/client/components/templates/Recipe/View/useDisplayRecipe';

export type MobileRecipeViewProps = Readonly<{
    className?: string;
    isPreview?: boolean;
    recipe: RecipeDTO;
}>;

export const MobileRecipeViewTemplate: React.FC<MobileRecipeViewProps> = ({
    className,
    isPreview = false,
    recipe
}) => {
    const { t } = useLocale();

    const { rateRecipe } = useDisplayRecipe(recipe);

    const tabs = [
        {
            title: t('app.recipe.ingredients'),
            content: (
                <IngredientsListView
                    key={`${recipe.id}-ingredients-list-view-mobile`}
                    ingredients={recipe.ingredients}
                    className={'pt-4'}
                    variant={'mobile'}
                />
            )
        },
        {
            title: t('app.recipe.instructions'),
            content: (
                <React.Fragment>
                    <InstructionsView
                        className={'pt-4'}
                        recipe={recipe}
                        variant={'mobile'}
                    />
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
                </React.Fragment>
            )
        }
    ];

    return (
        <div className={`max-w-screen-md mx-auto ${className}`}>
            <div className={'space-y-4'}>
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
                    <Rating
                        onClick={rateRecipe}
                        disabled={isPreview}
                        rating={recipe.rating}
                        fill={'gold'}
                        iconSize={22}
                        cooldown={60000}
                    />
                </div>
                <Divider />
                <Tabs tabs={tabs} buttonRowClassName={'sticky top-14 z-10'} />
            </div>
        </div>
    );
};
