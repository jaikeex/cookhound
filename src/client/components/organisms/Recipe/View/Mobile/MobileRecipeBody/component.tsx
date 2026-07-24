'use client';

import * as React from 'react';
import type { Recipe } from '@/common/types';
import { Typography } from '@/client/components/atoms/Typography';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { Divider } from '@/client/components/atoms/Divider';
import { InstructionsView } from '@/client/components/molecules/Instructions/View';
import { Tabs } from '@/client/components/molecules/Tabs';
import { IngredientsListView } from '@/client/components/organisms/IngredientsList/View';
import { useAuth } from '@/client/store';
import { classNames } from '@/client/utils';
import { t } from '@/client/locales';

export type MobileRecipeBodyProps = Readonly<{
    isPreview?: boolean;
    onShoppingListCreate?: () => void;
    recipe: Recipe;
}>;

export const MobileRecipeBody: React.FC<MobileRecipeBodyProps> = ({
    isPreview,
    onShoppingListCreate,
    recipe
}) => {
    const { user } = useAuth();

    const displayShoppingListButton = user && !isPreview;

    const tabs = [
        {
            title: t('app.recipe.ingredients'),
            content: (
                <React.Fragment>
                    <IngredientsListView
                        isPreview={isPreview}
                        key={`${recipe.id}-ingredients-list-view-mobile`}
                        ingredients={recipe.ingredients}
                        className={'py-4'}
                        variant={'mobile'}
                    />

                    {displayShoppingListButton ? (
                        <React.Fragment>
                            <Typography
                                variant={'label'}
                                className="px-12 mt-8 text-center text-gray-600 dark:text-gray-400"
                            >
                                {t(
                                    'app.recipe.create-shopping-list-description'
                                )}
                            </Typography>

                            <ButtonBase
                                color="secondary"
                                className={'w-full mt-2'}
                                onClick={onShoppingListCreate}
                                aria-label={t(
                                    'app.recipe.create-shopping-list'
                                )}
                            >
                                {t('app.recipe.create-shopping-list')}
                            </ButtonBase>
                        </React.Fragment>
                    ) : null}
                </React.Fragment>
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
                </React.Fragment>
            )
        }
    ];

    return (
        <Tabs
            tabs={tabs}
            buttonRowClassName={classNames(
                'z-10',
                isPreview ? '' : 'sticky top-14 '
            )}
        />
    );
};
