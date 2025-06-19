'use client';

import React from 'react';
import { RecipeForm, Sidebar } from '@/client/components';
import {
    DesktopRecipeViewSkeleton,
    DesktopRecipeViewTemplate
} from '@/client/components/templates/Recipe/View/Desktop';
import { useScreenSize } from '@/client/hooks';
import { useCreateRecipe } from '@/client/components/templates/Recipe/Create/useCreateRecipe';
import { useLocale } from '@/client/store/I18nContext';

type DesktopRecipeCreateProps = Readonly<{
    className?: string;
}>;

export const DesktopRecipeCreate: React.FC<DesktopRecipeCreateProps> = ({
    className
}) => {
    const { t } = useLocale();
    const { isTablet } = useScreenSize();
    const {
        formErrors,
        isSubmitting,
        recipeObject,
        handleSubmit,
        handleFormChange
    } = useCreateRecipe();

    return (
        <div className={`grid grid-cols-5 grid-rows-1 ${className}`}>
            <form
                className={
                    'col-span-5 pr-16 overflow-auto xl:col-span-2 min-w-[480px] xl:pr-0'
                }
                onSubmit={handleSubmit}
            >
                <RecipeForm
                    onChange={handleFormChange}
                    errors={formErrors}
                    pending={isSubmitting}
                />
            </form>

            {recipeObject ? (
                <Sidebar
                    withHandle
                    label={t('app.recipe.create-preview')}
                    position="right"
                    hidden={!isTablet}
                    className="w-[calc(100vw-12rem)]"
                >
                    <DesktopRecipeViewTemplate recipe={recipeObject} />
                </Sidebar>
            ) : null}

            <div className={'hidden col-span-3 px-2 xl:block'}>
                {recipeObject ? (
                    <>
                        <DesktopRecipeViewTemplate
                            recipe={recipeObject}
                            isPreview={true}
                            className="hidden xl:block"
                        />
                    </>
                ) : (
                    <DesktopRecipeViewSkeleton />
                )}
            </div>
        </div>
    );
};
