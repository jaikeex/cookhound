import React from 'react';
import type { Recipe } from '@/common/types/recipe';
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

export type MobileRecipeViewProps = Readonly<{
    className?: string;
    recipe: Recipe;
}>;

export const MobileRecipeViewTemplate: React.FC<MobileRecipeViewProps> = ({
    className,
    recipe
}) => {
    const { t } = useLocale();

    const tabs = [
        {
            title: t('app.recipe.ingredients'),
            content: (
                <IngredientsListView
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
                            <div className={'space-y-2 w-full'}>
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
                        className={'w-full h-48 object-cover rounded-md'}
                        width={500}
                        height={192}
                        placeholder={'blur'}
                        blurDataURL={generateImgPlaceholder(80, 80, 80)}
                    />
                ) : (
                    <div className={'w-full h-48 rounded-md'} />
                )}

                <Typography variant={'heading-xl'} className={'text-center'}>
                    {recipe.title}
                </Typography>

                <div className={'flex items-center gap-4'}>
                    <RecipeInfo
                        recipe={recipe}
                        verbose={false}
                        typographyVariant={'body'}
                    />
                    <Rating
                        rating={recipe.rating}
                        fill={'gold'}
                        className={'ml-auto'}
                        iconSize={22}
                    />
                </div>
                <Divider />
                <Tabs tabs={tabs} />
            </div>
        </div>
    );
};
