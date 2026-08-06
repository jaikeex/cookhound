'use client';

import * as React from 'react';
import type { Recipe } from '@/common/types';
import { Typography } from '@/client/components/atoms/Typography';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { Divider } from '@/client/components/atoms/Divider';
import { InstructionsView } from '@/client/components/molecules/Instructions/View';
import { TabBar } from '@/client/components/molecules/Tabs/Bar';
import { IngredientsListView } from '@/client/components/organisms/IngredientsList/View';
import { useAuth } from '@/client/store';
import { classNames } from '@/client/utils';
import { t } from '@/client/locales';

export type RecipeViewBodyProps = Readonly<{
    isPreview?: boolean;
    onShoppingListCreate?: () => void;
    recipe: Recipe;
}>;

export const RecipeViewBody: React.FC<RecipeViewBodyProps> = ({
    isPreview,
    onShoppingListCreate,
    recipe
}) => {
    const { user } = useAuth();

    const [activeSection, setActiveSection] = React.useState(0);

    const displayShoppingListButton = user && !isPreview;

    return (
        <div>
            <TabBar
                titles={[
                    t('app.recipe.ingredients'),
                    t('app.recipe.instructions')
                ]}
                activeIndex={activeSection}
                onTabSelect={setActiveSection}
                className={classNames(
                    'z-10 @recipe:hidden',
                    isPreview ? '' : 'sticky top-14'
                )}
            />

            <div
                className={
                    'mt-3 min-h-16 @recipe:mt-0 @recipe:flex @recipe:gap-12'
                }
            >
                <section
                    className={classNames(
                        activeSection !== 0 && 'hidden',
                        '@recipe:block @recipe:w-[35%]'
                    )}
                >
                    <Typography
                        as="h2"
                        variant={'heading-sm'}
                        className={'sr-only @recipe:not-sr-only'}
                    >
                        {t('app.recipe.ingredients')}
                    </Typography>

                    <IngredientsListView
                        isPreview={isPreview}
                        ingredients={recipe.ingredients}
                        className={'py-4 @recipe:py-0 @recipe:mt-4'}
                    />

                    {displayShoppingListButton ? (
                        <React.Fragment>
                            <Typography
                                variant={'label'}
                                className="px-12 @recipe:px-0 mt-8 text-center text-gray-600 dark:text-gray-400"
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
                </section>

                <section
                    className={classNames(
                        activeSection !== 1 && 'hidden',
                        '@recipe:block @recipe:w-[65%] @recipe:space-y-2'
                    )}
                >
                    <Typography
                        as="h2"
                        variant={'heading-sm'}
                        className={'sr-only @recipe:not-sr-only'}
                    >
                        {t('app.recipe.instructions')}
                    </Typography>

                    <InstructionsView
                        className={'pt-4 @recipe:pt-0'}
                        recipe={recipe}
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
                </section>
            </div>
        </div>
    );
};
