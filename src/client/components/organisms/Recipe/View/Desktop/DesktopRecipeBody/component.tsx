'use client';

import * as React from 'react';
import { useAuth, useLocale } from '@/client/store';
import type { RecipeDTO } from '@/common/types/recipe';
import {
    Typography,
    ButtonBase,
    Divider,
    InstructionsView
} from '@/client/components';
import { IngredientsListView } from '@/client/components/organisms/IngredientsList';

export type DesktopRecipeBodyProps = Readonly<{
    isPreview?: boolean;
    onShoppingListCreate?: () => void;
    recipe: RecipeDTO;
}>;

export const DesktopRecipeBody: React.FC<DesktopRecipeBodyProps> = ({
    isPreview,
    onShoppingListCreate,
    recipe
}) => {
    const { t } = useLocale();
    const { user } = useAuth();

    const displayShoppingListButton = user && !isPreview;

    return (
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

                {displayShoppingListButton ? (
                    <ButtonBase
                        color="secondary"
                        className={'w-full mt-8'}
                        onClick={onShoppingListCreate}
                    >
                        <Typography variant={'body'} className={'text-center'}>
                            {t('app.recipe.create-shopping-list')}
                        </Typography>
                    </ButtonBase>
                ) : null}
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
    );
};
