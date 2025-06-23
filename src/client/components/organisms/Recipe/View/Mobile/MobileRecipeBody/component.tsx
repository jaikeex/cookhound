'use client';

import * as React from 'react';
import type { RecipeDTO } from '@/common/types';
import {
    Typography,
    ButtonBase,
    Divider,
    InstructionsView,
    Tabs
} from '@/client/components';
import { IngredientsListView } from '@/client/components/organisms/IngredientsList';
import { useAuth, useLocale } from '@/client/store';

export type MobileRecipeBodyProps = Readonly<{
    isPreview?: boolean;
    onShoppingListCreate?: () => void;
    recipe: RecipeDTO;
}>;

export const MobileRecipeBody: React.FC<MobileRecipeBodyProps> = ({
    isPreview,
    onShoppingListCreate,
    recipe
}) => {
    const { t } = useLocale();
    const { user } = useAuth();

    const displayShoppingListButton = user && !isPreview;

    const tabs = [
        {
            title: t('app.recipe.ingredients'),
            content: (
                <React.Fragment>
                    <IngredientsListView
                        key={`${recipe.id}-ingredients-list-view-mobile`}
                        ingredients={recipe.ingredients}
                        className={'pt-4'}
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
                            >
                                <Typography
                                    variant={'body'}
                                    className={'text-center'}
                                >
                                    {t('app.recipe.create-shopping-list')}
                                </Typography>
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

    return <Tabs tabs={tabs} buttonRowClassName={'sticky top-14 z-10'} />;
};
