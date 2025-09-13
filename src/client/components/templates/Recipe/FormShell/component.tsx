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

export type RecipeFormShellProps = Readonly<{
    recipeObject: RecipeDTO | null;
    defaultValues: RecipeDTO | null;
    isSidebarVisible: boolean;
    isMobile: boolean;
    isTablet: boolean;
    isPending: boolean;
    isUploadingImage: boolean;
    isPreviewOpen: boolean;
    handleFormChange: (name: string, value: any) => void;
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
    return (
        <div
            className={classNames(
                'block md:grid grid-cols-7 grid-rows-1',
                isSidebarVisible && isMobile ? 'pb-4' : 'pb-0',
                isSidebarVisible && isTablet ? 'pr-8' : 'pr-0'
            )}
        >
            <form
                className={classNames(
                    'col-span-7 overflow-auto xl:col-span-3',
                    'w-full min-w-[240px] md:min-w-[480px] md:w-auto'
                )}
                onSubmit={handleSubmit}
                ref={formRef}
            >
                <RecipeForm
                    onChange={handleFormChange}
                    errors={formErrors}
                    pending={isPending || isUploadingImage}
                    defaultValues={mode === 'edit' ? defaultValues : null}
                    mode={mode}
                />
            </form>

            {/*-------------------------------------------------------------------------------------*/}
            {/*                                   MOBILE PREVIEW                                    */}
            {/*-------------------------------------------------------------------------------------*/}

            {isSidebarVisible && isMobile && !isPreviewOpen ? (
                <SidebarHandle onOpen={handleOpenPreview} />
            ) : null}

            {isSidebarVisible && isMobile ? (
                <>
                    <div
                        id="preview-handle-background"
                        className={classNames(
                            'fixed left-0 w-[100dvw] h-12 bottom-0',
                            'bg-gradient-to-t from-[#f0fdf4] via-[#f0fdf4] via-80% to-transparent',
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
                            <MobileRecipeViewTemplate
                                recipe={recipeObject}
                                isPreview={true}
                            />
                        )}
                    </Sidebar>
                </>
            ) : null}

            {/*-------------------------------------------------------------------------------------*/}
            {/*                                   TABLET PREVIEW                                    */}
            {/*-------------------------------------------------------------------------------------*/}

            {isSidebarVisible && isTablet && !isPreviewOpen ? (
                <SidebarHandle onOpen={handleOpenPreview} position="right" />
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
                        <DesktopRecipeViewTemplate
                            recipe={recipeObject}
                            isPreview={true}
                        />
                    )}
                </Sidebar>
            ) : null}

            {/*-------------------------------------------------------------------------------------*/}
            {/*                                   DESKTOP PREVIEW                                   */}
            {/*-------------------------------------------------------------------------------------*/}

            <div className={'hidden col-span-4 px-2 xl:block'}>
                {recipeObject ? (
                    <DesktopRecipeViewTemplate
                        recipe={recipeObject}
                        isPreview={true}
                        className="hidden xl:block"
                    />
                ) : (
                    <DesktopRecipeViewSkeleton />
                )}
            </div>
        </div>
    );
};
