'use client';

import * as React from 'react';
import { useAuth } from '@/client/store';
import type { Recipe } from '@/common/types/recipe';
import { Typography } from '@/client/components/atoms/Typography';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { Divider } from '@/client/components/atoms/Divider';
import { InstructionsView } from '@/client/components/molecules/Instructions/View';
import { IngredientsListView } from '@/client/components/organisms/IngredientsList/View';
import { t } from '@/client/locales';

export type DesktopRecipeBodyProps = Readonly<{
    isPreview?: boolean;
    onShoppingListCreate?: () => void;
    recipe: Recipe;
}>;

export const DesktopRecipeBody: React.FC<DesktopRecipeBodyProps> = ({
    isPreview,
    onShoppingListCreate,
    recipe
}) => {
    const { user } = useAuth();

    const displayShoppingListButton = user && !isPreview;

    return (
        <div className={'flex gap-12'}>
            <div className={'w-[35%]'}>
                <Typography as="h2" variant={'heading-sm'}>
                    {t('app.recipe.ingredients')}
                </Typography>
                <IngredientsListView
                    isPreview={isPreview}
                    key={`${recipe.id}-ingredients-list-view-desktop`}
                    ingredients={recipe.ingredients}
                    className={'mt-4'}
                    variant={'desktop'}
                />

                {displayShoppingListButton ? (
                    <React.Fragment>
                        <Typography
                            variant={'label'}
                            className="mt-8 text-center text-gray-600 dark:text-gray-400"
                        >
                            {t('app.recipe.create-shopping-list-description')}
                        </Typography>

                        <ButtonBase
                            color="secondary"
                            className={'w-full mt-2'}
                            onClick={onShoppingListCreate}
                            aria-label={t('app.recipe.create-shopping-list')}
                        >
                            {t('app.recipe.create-shopping-list')}
                        </ButtonBase>
                    </React.Fragment>
                ) : null}
            </div>

            <div className={'space-y-2 w-[65%]'}>
                <Typography as="h2" variant={'heading-sm'}>
                    {t('app.recipe.instructions')}
                </Typography>
                <InstructionsView recipe={recipe} variant={'desktop'} />

                {recipe.notes ? (
                    <React.Fragment>
                        <Divider dashed={true} className={'mt-8!'} />
                        <div className={'w-full space-y-2'}>
                            <Typography as="h2" variant={'heading-sm'}>
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
    );
};
