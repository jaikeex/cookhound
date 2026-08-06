'use client';

import React from 'react';
import { Sidebar } from '@/client/components/molecules/Sidebar';
import { SidebarHandle } from '@/client/components/molecules/Sidebar/Handle';
import { RecipeViewLayout } from '@/client/components/templates/Recipe/View/Layout';
import { DesktopRecipeViewSkeleton } from '@/client/components/templates/Recipe/View/Skeletons';
import {
    RecipeForm,
    type RecipeFormErrors
} from '@/client/components/organisms/Form/Recipe';
import { classNames } from '@/client/utils';
import type { Recipe } from '@/common/types';
import type { RecipeFormMode } from '@/client/types/core';
import { RecipeHandlingProvider } from '@/client/store';
import { t } from '@/client/locales';

/**
 * RecipeViewLayout picks its shape from the width of its own container, not the viewport.
 * That is what makes one tree serve both the public page and these panels, but it means a
 * panel has to be desktop-width to preview the desktop layout, and this one never is. The
 * grid is capped at max-w-screen-xl (1200px) and this column is 4/7 of it, so the panel
 * tops out at 669.7px inside its px-2 - well under the threshold, however wide the monitor
 * gets. Left alone the column previews the mobile layout on every screen.
 *
 * So the preview is pinned to a 768px box - max-w-3xl, the same width the article gets on
 * a wide public page, so this is pixel-faithful rather than merely desktop-shaped - and
 * scaled to fit.
 */
const PREVIEW_VIEWPORT = 'w-[768px] origin-top-left scale-[0.82]';

export type RecipeFormShellProps = Readonly<{
    recipeObject: Recipe | null;
    defaultValues: Recipe | null;
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
    /**
     * This memo is imporant to prevent the edit form fields from resetting when the form remounts.
     * The main source of mounts are url changes, and there are two ways that can happen: TahSelectionModal
     * and preview Sidebar openings.
     */
    const initialDefaultValuesRef = React.useRef<Recipe | null>(null);

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
                    'w-full min-w-60 md:min-w-120 md:w-auto'
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
                                <RecipeViewLayout isPreview={true} />
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
                            <RecipeViewLayout isPreview={true} />
                        </RecipeHandlingProvider>
                    )}
                </Sidebar>
            ) : null}

            {/*-------------------------------------------------------------------------------------*/}
            {/*                                   DESKTOP PREVIEW                                   */}
            {/*-------------------------------------------------------------------------------------*/}

            <div
                className={'hidden col-span-4 px-2 overflow-x-hidden xl:block'}
            >
                <div className={PREVIEW_VIEWPORT}>
                    {recipeObject ? (
                        <RecipeHandlingProvider recipe={recipeObject}>
                            <RecipeViewLayout isPreview={true} />
                        </RecipeHandlingProvider>
                    ) : (
                        <DesktopRecipeViewSkeleton />
                    )}
                </div>
            </div>
        </div>
    );
};
