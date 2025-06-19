'use client';

import React from 'react';
import type { RecipeDTO } from '@/common/types/recipe';
import {
    Divider,
    IngredientsListView,
    InstructionsView,
    Rating,
    RecipeInfo,
    Typography
} from '@/client/components';
import Image from 'next/image';
import { generateImgPlaceholder } from '@/client/utils';
import { useLocale } from '@/client/store';

export type DesktopRecipeViewProps = Readonly<{
    className?: string;
    recipe: RecipeDTO;
    ref?: React.RefObject<HTMLDivElement> | null;
}>;

export const DesktopRecipeViewTemplate: React.FC<DesktopRecipeViewProps> = ({
    className,
    recipe,
    ref
}) => {
    const { t } = useLocale();

    return (
        <div
            className={`max-w-screen-md 3xl:max-w-screen-lg px-4 mx-auto ${className}`}
            ref={ref}
        >
            <div className={'space-y-4'}>
                <div className={'flex justify-between gap-12'}>
                    <div
                        className={
                            'flex flex-col justify-between items-start w-full'
                        }
                    >
                        <div className={'flex flex-col w-full gap-2'}>
                            <Typography variant={'heading-xl'}>
                                {recipe.title}
                            </Typography>
                            <Rating
                                rating={recipe.rating}
                                fill={'gold'}
                                iconSize={22}
                            />
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
                                'w-full max-w-80 h-48 object-cover rounded-md'
                            }
                            width={320}
                            height={192}
                            placeholder={'blur'}
                            blurDataURL={generateImgPlaceholder(80, 80, 80)}
                        />
                    ) : (
                        <div className={'w-full max-w-80 h-48 rounded-md'} />
                    )}
                </div>

                <Divider />

                <div className={'flex gap-12'}>
                    <div className={'space-y-2 w-[35%]'}>
                        <Typography variant={'heading-sm'}>
                            {t('app.recipe.ingredients')}
                        </Typography>
                        <IngredientsListView
                            key={`${recipe.id}-ingredients-list-view-desktop`}
                            ingredients={recipe.ingredients}
                            className={'pt-2'}
                            variant={'desktop'}
                        />
                    </div>

                    <div className={'space-y-2 w-[65%]'}>
                        <Typography variant={'heading-sm'}>
                            {t('app.recipe.instructions')}
                        </Typography>
                        <InstructionsView recipe={recipe} variant={'desktop'} />

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
                    </div>
                </div>
            </div>
        </div>
    );
};
