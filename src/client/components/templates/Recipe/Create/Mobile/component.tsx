'use client';

import React from 'react';
import {
    MobileRecipeViewTemplate,
    RecipeForm,
    Sidebar
} from '@/client/components';
import { useCreateRecipe } from '@/client/components/templates/Recipe/Create/useCreateRecipe';
import classNames from 'classnames';
import { useLocale } from '@/client/store/I18nContext';

type MobileRecipeCreateProps = Readonly<{
    className?: string;
}>;

export const MobileRecipeCreate: React.FC<MobileRecipeCreateProps> = ({
    className
}) => {
    const { t } = useLocale();
    const {
        formErrors,
        isSubmitting,
        recipeObject,
        changedFields,
        handleSubmit,
        handleFormChange
    } = useCreateRecipe();

    /**
     * This could be done by simply checking if the recipeObject fields are not empty.
     * However, the intention here was to keep the sidebar visible when the user deletes
     * the content of some of the required fields after already changing them.
     * The preview jumping from visible to hidden is confusing as fuck.
     */
    const isSidebarVisible =
        recipeObject &&
        changedFields.length >= 3 &&
        changedFields.includes('ingredients') &&
        changedFields.includes('instructions') &&
        changedFields.includes('title');

    return (
        <div
            className={classNames(
                className,
                isSidebarVisible ? 'pb-4' : 'pb-0'
            )}
        >
            <form className={'w-full overflow-auto'} onSubmit={handleSubmit}>
                <RecipeForm
                    onChange={handleFormChange}
                    errors={formErrors}
                    pending={isSubmitting}
                />
            </form>

            {isSidebarVisible ? (
                <React.Fragment>
                    <div
                        id="preview-handle-background"
                        className={classNames(
                            /**
                             * Simple bg faker to give the preview handle some breathing space.
                             *
                             * The width calculation is done in order to prevent ovelapping with the document
                             * scrollbar. Seems sketchy, but no better solution comes to mind...
                             * Might not even be necessary given it only happens on pc while viewing baby screen.
                             */
                            //TODO: Do this better.
                            'fixed left-0 w-[calc(100dvw-15px)] h-20 bottom-12',
                            'bg-gradient-to-t from-[#f0fdf4] via-[#f0fdf4] via-80% to-transparent',
                            'dark:from-[#030712] dark:via-[#030712] dark:via-80% dark:to-transparent'
                        )}
                    />
                    <Sidebar
                        withHandle
                        label={t('app.recipe.create-preview')}
                        position="bottom"
                        className="h-[calc(100vh-12rem)] dark:bg-[#030712] bg-[#d1fae5]"
                    >
                        <MobileRecipeViewTemplate
                            recipe={recipeObject}
                            isPreview={true}
                        />
                    </Sidebar>
                </React.Fragment>
            ) : null}
        </div>
    );
};
