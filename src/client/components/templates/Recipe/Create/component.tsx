'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
    MobileRecipeViewTemplate,
    RecipeForm,
    Sidebar,
    type RecipeFormErrors,
    SidebarHandle
} from '@/client/components';
import {
    DesktopRecipeViewSkeleton,
    DesktopRecipeViewTemplate
} from '@/client/components/templates/Recipe/View/Desktop';
import { useScreenSize, useUnsavedChangesWarning } from '@/client/hooks';
import { useSnackbar, useLocale, useCreateRecipeStore } from '@/client/store';
import {
    fileToByteArray,
    generateUuid,
    lowerCaseFirstLetter,
    validateFormData
} from '@/client/utils';
import type { I18nMessage } from '@/client/locales';
import type {
    RecipeForCreatePayload,
    Ingredient,
    RecipeDTO
} from '@/common/types';
import { classNames } from '@/client/utils';
import { z } from 'zod';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { useQueryClient } from '@tanstack/react-query';

//~---------------------------------------------------------------------------------------------~//
//$                                           SCHEMA                                            $//
//~---------------------------------------------------------------------------------------------~//

export const createRecipeSchema = z.object({
    title: z.string().trim().trim().min(1, 'app.recipe.error.title-required'),
    portionSize: z.number().nullable(),
    time: z.number().nullable(),
    imageUrl: z.string().trim().nullable(),
    notes: z.string().trim().nullable(),
    ingredients: z
        .array(
            z.object({
                name: z.string().trim().min(1).max(100),
                quantity: z.string().trim().max(256)
            })
        )
        .min(1, 'app.recipe.error.ingredients-required'),
    instructions: z
        .array(z.string().trim().min(1))
        .min(1, 'app.recipe.error.instructions-required')
});

type RecipeForCreateFormData = {
    title: string;
    portionSize: number | null;
    time: number | null;
    imageUrl: string | null;
    notes: string | null;
    ingredients: Omit<Ingredient, 'id'>[];
    instructions: string[];
};

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

type RecipeCreateProps = Readonly<NonNullable<unknown>>;

export const RecipeCreate: React.FC<RecipeCreateProps> = () => {
    //|-----------------------------------------------------------------------------------------|//
    //?                                          STATE                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const { t, locale } = useLocale();
    const { alert } = useSnackbar();
    const { isTablet, isMobile } = useScreenSize();
    const queryClient = useQueryClient();

    const [changedFields, setChangedFields] = useState<string[]>([]);

    const [formErrors, setFormErrors] = useState<RecipeFormErrors>({});
    const { recipeObject, setRecipeObject, updateRecipeObject } =
        useCreateRecipeStore();

    const formElement = useRef<HTMLFormElement>(null);

    const { mutateAsync: uploadImageMutation, isPending: isUploadingImage } =
        chqc.file.useUploadRecipeImage();

    const { mutate: createRecipe, isPending } = chqc.recipe.useCreateRecipe({
        onSuccess: (recipe) => {
            /**
             * Invalidate all but targeted queries. These are not yet cached for the new
             * recipe anyway, and other recipes are not impacted. The queries invalidated
             * include all lists and searches.
             * This could have been done by targeting the batch queries directly,
             * but this seems more future-proof as the targeted queries are unlikely
             * to change and other searches are likely to be added.
             */
            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.queryKey[0] === QUERY_KEYS.recipe.namespace &&
                    query.queryKey[1] !== 'display' &&
                    query.queryKey[1] !== 'id'
            });

            alert({
                message: t('app.recipe.create-success'),
                variant: 'success'
            });

            handleCreateRecipeSuccess(recipe);
        },
        onError: (error) => {
            setFormErrors({
                server: (error?.message as I18nMessage) || 'app.error.default'
            });
        }
    });

    const hasUnsavedChanges = changedFields.length > 0 && !isPending;
    const { allowNavigation, safePush } = useUnsavedChangesWarning({
        hasUnsavedChanges,
        message: t('app.recipe.unsaved-changes-warning')
    });

    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

    const handleOpenPreview = useCallback(() => setIsPreviewOpen(true), []);
    const handleClosePreview = useCallback(() => setIsPreviewOpen(false), []);

    //|-----------------------------------------------------------------------------------------|//
    //?                                      UPLOAD IMAGE                                       ?//
    //|-----------------------------------------------------------------------------------------|//

    const uploadRecipeImage = useCallback(
        async (data: FormData): Promise<string | null> => {
            let image_url: string | null = null;

            try {
                const imageFile = data.get('recipe-image') as File;

                if (imageFile.size > 0) {
                    const imageBytes = await fileToByteArray(imageFile);
                    const response = await uploadImageMutation({
                        bytes: imageBytes,
                        fileName: `recipe-image-${generateUuid()}`
                    });

                    image_url = response.objectUrl;
                }
            } catch (error: unknown) {
                alert({
                    message: t('app.error.image-upload-failed'),
                    variant: 'error'
                });

                /**
                 * Do nothing here. If the upload fails, the recipe can still be created, and the user can
                 * edit the image in later. Failing the submission risks the user losing their work.
                 * (which should never happen, but you never know...)
                 */
            }

            return image_url;
        },
        [alert, t, uploadImageMutation]
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                         SUBMIT                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const handleCreateRecipeSuccess = useCallback(
        (recipe: RecipeDTO) => {
            allowNavigation();
            formElement.current?.reset();
            setChangedFields([]);
            safePush(`/recipe/${recipe.displayId}`);
        },
        [safePush, allowNavigation, formElement]
    );

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault(); // Prevent default form submission

            const formElement = event.currentTarget;
            const data = new FormData(formElement);
            let formData: RecipeForCreateFormData;

            try {
                formData = await extractFormData(data);

                const validationErrors: RecipeFormErrors =
                    await validateFormData(formData, createRecipeSchema);

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    return;
                }
            } catch (error: unknown) {
                setFormErrors({ server: 'auth.error.default' });
                return;
            }

            // If here, the data should be valid
            setFormErrors({});

            const imageUrl = await uploadRecipeImage(data);
            if (imageUrl) {
                formData.imageUrl = imageUrl;
            }

            const recipeForCreate: RecipeForCreatePayload = {
                ...formData,
                language: locale || 'en'
            };

            createRecipe(recipeForCreate);
        },
        [createRecipe, locale, uploadRecipeImage]
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                        ON CHANGE                                        ?//
    //|-----------------------------------------------------------------------------------------|//

    const handleFormChange = useCallback(
        (name: string, value: any) => {
            let newValue: any = value;

            if (name === 'ingredients' && value) {
                newValue = value.map((ingredient: Ingredient) => ({
                    ...ingredient,
                    name: lowerCaseFirstLetter(ingredient.name)
                }));
            }

            if (name === 'title' && (!value || value.length === 0)) {
                newValue = t('app.recipe.title');
            }

            updateRecipeObject(name, newValue);

            if (!changedFields.includes(name) && newValue?.length > 0) {
                setChangedFields([...changedFields, name]);
            }
        },
        [updateRecipeObject, t, changedFields]
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                     REST AND RENDER                                     ?//
    //|-----------------------------------------------------------------------------------------|//

    useEffect(() => {
        setRecipeObject(createRecipePlaceholder(t));
    }, [setRecipeObject, t]);

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
                'block md:grid grid-cols-5 grid-rows-1',
                isSidebarVisible && isMobile ? 'pb-4' : 'pb-0',
                isSidebarVisible && isTablet ? 'pr-8' : 'pr-0'
            )}
        >
            <form
                className={classNames(
                    'col-span-5 overflow-auto xl:col-span-2',
                    'w-full min-w-[240px] md:min-w-[480px] md:w-auto'
                )}
                onSubmit={handleSubmit}
                ref={formElement}
            >
                <RecipeForm
                    onChange={handleFormChange}
                    errors={formErrors}
                    pending={isPending || isUploadingImage}
                />
            </form>

            {/*-------------------------------------------------------------------------------------*/}
            {/*                                   MOBILE PREVIEW                                    */}
            {/*-------------------------------------------------------------------------------------*/}

            {isSidebarVisible && isMobile && !isPreviewOpen ? (
                <SidebarHandle onOpen={handleOpenPreview} />
            ) : null}

            {isSidebarVisible && isMobile ? (
                <React.Fragment>
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
                        isOpen={isPreviewOpen}
                        onClose={handleClosePreview}
                    >
                        <MobileRecipeViewTemplate
                            recipe={recipeObject}
                            isPreview={true}
                        />
                    </Sidebar>
                </React.Fragment>
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
                    className="w-[calc(100vw-12rem)]"
                    isOpen={isPreviewOpen}
                    onClose={handleClosePreview}
                >
                    <DesktopRecipeViewTemplate
                        recipe={recipeObject}
                        isPreview={true}
                    />
                </Sidebar>
            ) : null}

            {/*-------------------------------------------------------------------------------------*/}
            {/*                                   DESKTOP PREVIEW                                   */}
            {/*-------------------------------------------------------------------------------------*/}

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

//~---------------------------------------------------------------------------------------------~//
//$                                          FUNCTIONS                                          $//
//~---------------------------------------------------------------------------------------------~//

const createRecipePlaceholder = (
    t: (key: I18nMessage) => string
): RecipeDTO => ({
    id: 0,
    displayId: '',
    rating: null,
    timesRated: 0,
    timesViewed: 0,
    language: 'en',
    imageUrl: '/img/recipe-placeholder.webp',
    title: t('app.recipe.title'),
    portionSize: null,
    flags: [],
    time: null,
    notes: null,
    ingredients: [],
    instructions: [],
    authorId: 0
});

async function extractFormData(
    data: FormData
): Promise<RecipeForCreateFormData> {
    const ingredientKeys = Array.from(data.keys()).filter((key) =>
        key.startsWith('ingredient-name')
    );

    const ingredients = ingredientKeys
        .map((key) => {
            const index = key.split('-')[2];
            const name =
                data
                    .get(`ingredient-name-${index}`)
                    ?.toString()
                    .toLowerCase()
                    .trim() || '';

            return {
                name,
                quantity:
                    (data.get(`ingredient-quantity-${index}`) as string) || null
            };
        })
        .filter((ingredient) => ingredient?.name && ingredient.name.length > 0);

    const instructionKeys = Array.from(data.keys()).filter((key) =>
        key.startsWith('instruction')
    );

    const instructions = instructionKeys
        .map((key) => data.get(key) as string)
        .filter((instruction) => instruction.length > 0);

    return {
        title: data.get('title') as string,
        portionSize: parseInt(data.get('portionSize') as string) || null,
        time: parseInt(data.get('time') as string) || null,
        imageUrl: null,
        notes: data.get('notes') as string,
        ingredients,
        instructions
    };
}
