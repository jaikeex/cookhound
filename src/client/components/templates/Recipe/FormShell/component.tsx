'use client';

import React from 'react';
import {
    MobileRecipeViewTemplate,
    Sidebar,
    SidebarHandle,
    DesktopRecipeViewTemplate,
    DesktopRecipeViewSkeleton,
    RecipeForm,
    type RecipeFormErrors
} from '@/client/components';
import { classNames } from '@/client/utils';
import type { RecipeDTO } from '@/common/types';
import type { RecipeFormMode } from '@/client/types/core';
import { useLocale, RecipeHandlingProvider } from '@/client/store';

export type RecipeFormShellProps = Readonly<{
    recipeObject: RecipeDTO | null;
    defaultValues: RecipeDTO | null;
    isSidebarVisible: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isPending: boolean;
    isUploadingImage: boolean;
    isPreviewOpen: boolean;
    handleFormChange: (name: string, value: unknown) => void;
    formErrors: RecipeFormErrors;
    formRef: React.RefObject<HTMLFormElement | null>;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    handleOpenPreview: () => void;
    handleClosePreview: () => void;
    mode: RecipeFormMode;
}>;

export const RecipeFormShell: React.FC<RecipeFormShellProps> = ({
    recipeObject,
    defaultValues,
    isSidebarVisible,
    isMobile,
    isTablet,
    isPending,
    isUploadingImage,
    isPreviewOpen,
    handleFormChange,
    formErrors,
    formRef,
    handleSubmit,
    handleOpenPreview,
    handleClosePreview,
    mode
}) => {
    const { t } = useLocale();
    /**
     * This memo is imporant to prevent the edit form fields from resetting when the form remounts.
     * The main source of mounts are url changes, and there are two ways that can happen: TahSelectionModal
     * and preview Sidebar openings.
     */
    const initialDefaultValuesRef = React.useRef<RecipeDTO | null>(null);

    if (initialDefaultValuesRef.current === null) {
        initialDefaultValuesRef.current =
            mode === 'edit' ? defaultValues : null;
    }

    const effectiveDefaultValues = initialDefaultValuesRef.current;

    return (
        <div
            className={classNames(
                'block md:grid grid-cols-7 grid-rows-1 max-w-screen-xl mx-auto',
                isSidebarVisible && isMobile ? 'pb-4' : 'pb-0',
                isSidebarVisible && isTablet ? 'pr-8' : 'pr-0'
            )}
        >
            <form
                className={classNames(
                    'col-span-7 overflow-auto xl:col-span-3 pb-8',
                    'w-full min-w-[240px] md:min-w-[480px] md:w-auto'
                )}
                onSubmit={handleSubmit}
                ref={formRef}
            >
                <RecipeForm
                    key={`${mode}-${effectiveDefaultValues?.id ?? 'new'}`}
                    onChange={handleFormChange}
                    errors={formErrors}
                    pending={isPending || isUploadingImage}
                    defaultValues={effectiveDefaultValues}
                    mode={mode}
                />
            </form>

            {/*-------------------------------------------------------------------------------------*/}
            {/*                                   MOBILE PREVIEW                                    */}
            {/*-------------------------------------------------------------------------------------*/}

            {isSidebarVisible && isMobile && !isPreviewOpen ? (
                <SidebarHandle
                    onOpen={handleOpenPreview}
                    label={t('app.recipe.create-preview')}
                />
            ) : null}

            {isSidebarVisible && isMobile ? (
                <>
                    <div
                        id="preview-handle-background"
                        className={classNames(
                            'fixed left-0 w-dvw h-12 bottom-0',
                            'bg-linear-to-t from-[#f0fdf4] via-[#f0fdf4] via-80% to-transparent',
                            'dark:from-[#030712] dark:via-[#030712] dark:via-80% dark:to-transparent'
                        )}
                    />
                    <Sidebar
                        position="bottom"
                        className="h-[calc(100vh-12rem)] dark:bg-[#030712] bg-[#d1fae5]"
                        paramKey="preview"
                        isOpen={isPreviewOpen}
                        onClose={handleClosePreview}
                    >
                        {recipeObject && (
                            <RecipeHandlingProvider recipe={recipeObject}>
                                <MobileRecipeViewTemplate isPreview={true} />
                            </RecipeHandlingProvider>
                        )}
                    </Sidebar>
                </>
            ) : null}

            {/*-------------------------------------------------------------------------------------*/}
            {/*                                   TABLET PREVIEW                                    */}
            {/*-------------------------------------------------------------------------------------*/}

            {isSidebarVisible && isTablet && !isPreviewOpen ? (
                <SidebarHandle
                    onOpen={handleOpenPreview}
                    position="right"
                    label={t('app.recipe.create-preview')}
                />
            ) : null}

            {isSidebarVisible && isTablet ? (
                <Sidebar
                    position="right"
                    hidden={!isTablet}
                    paramKey="preview"
                    className="w-[calc(100vw-12rem)]"
                    isOpen={isPreviewOpen}
                    onClose={handleClosePreview}
                >
                    {recipeObject && (
                        <RecipeHandlingProvider recipe={recipeObject}>
                            <DesktopRecipeViewTemplate isPreview={true} />
                        </RecipeHandlingProvider>
                    )}
                </Sidebar>
            ) : null}

            {/*-------------------------------------------------------------------------------------*/}
            {/*                                   DESKTOP PREVIEW                                   */}
            {/*-------------------------------------------------------------------------------------*/}

            <div className={'hidden col-span-4 px-2 xl:block'}>
                {recipeObject ? (
                    <RecipeHandlingProvider recipe={recipeObject}>
                        <DesktopRecipeViewTemplate
                            isPreview={true}
                            className="hidden xl:block"
                        />
                    </RecipeHandlingProvider>
                ) : (
                    <DesktopRecipeViewSkeleton />
                )}
            </div>
        </div>
    );
};
