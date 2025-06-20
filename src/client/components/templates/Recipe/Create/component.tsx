'use client';

import React, { useCallback, useEffect, useState } from 'react';
import {
    MobileRecipeViewTemplate,
    RecipeForm,
    Sidebar,
    type RecipeFormErrors
} from '@/client/components';
import {
    DesktopRecipeViewSkeleton,
    DesktopRecipeViewTemplate
} from '@/client/components/templates/Recipe/View/Desktop';
import { useScreenSize, useUnsavedChangesWarning } from '@/client/hooks';
import { useSnackbar, useLocale, useCreateRecipeStore } from '@/client/store';
import apiClient from '@/client/request';
import {
    fileToByteArray,
    generateUuid,
    lowerCaseFirstLetter,
    validateFormData
} from '@/client/utils';
import type { I18nMessage } from '@/client/locales';
import type { AlertPayload } from '@/client/types';
import type {
    RecipeForCreatePayload,
    Ingredient,
    RecipeDTO
} from '@/common/types';
import classNames from 'classnames';
import type { ObjectSchema } from 'yup';
import { array, number, object, string } from 'yup';

//~---------------------------------------------------------------------------------------------~//
//$                                           SCHEMA                                            $//
//~---------------------------------------------------------------------------------------------~//

export const createRecipeSchema: ObjectSchema<RecipeForCreateFormData> = object(
    {
        title: string().required('app.recipe.error.title-required'),
        difficulty: string().required(),
        portionSize: number().nullable().defined(),
        time: number().nullable().defined(),
        imageUrl: string().nullable().defined(),
        notes: string().nullable().defined(),
        ingredients: array()
            .of(
                object().shape({
                    name: string().required().max(100),
                    quantity: string().required().max(256)
                })
            )
            .min(1, 'app.recipe.error.ingredients-required')
            .required('app.recipe.error.ingredients-required'),
        instructions: array(string().required())
            .min(1, 'app.recipe.error.instructions-required')
            .required('app.recipe.error.instructions-required')
    }
);

type RecipeForCreateFormData = {
    title: string;
    difficulty: string;
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

    const [changedFields, setChangedFields] = useState<string[]>([]);

    const [formErrors, setFormErrors] = useState<RecipeFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { recipeObject, setRecipeObject, updateRecipeObject } =
        useCreateRecipeStore();

    const hasUnsavedChanges = changedFields.length > 0 && !isSubmitting;
    const { allowNavigation, safePush } = useUnsavedChangesWarning({
        hasUnsavedChanges,
        message: t('app.recipe.unsaved-changes-warning')
    });

    //|-----------------------------------------------------------------------------------------|//
    //?                                         SUBMIT                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault(); // Prevent default form submission

            const formElement = event.currentTarget;
            const data = new FormData(formElement);
            let formData: RecipeForCreateFormData;

            // This check is likely overkill, but I like it.
            if (isSubmitting) return;
            setIsSubmitting(true);

            try {
                formData = await extractFormData(data);

                const validationErrors: RecipeFormErrors =
                    await validateFormData(formData, createRecipeSchema);

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    setIsSubmitting(false);
                    return;
                }
            } catch (error) {
                setFormErrors({ server: 'auth.error.default' });
                setIsSubmitting(false);
                return;
            }

            try {
                // If here, the data should be valid
                setFormErrors({});

                const imageUrl = await uploadImage(data, alert, t);
                if (imageUrl) {
                    formData.imageUrl = imageUrl;
                }

                const recipeForCreate: RecipeForCreatePayload = {
                    ...formData,
                    language: locale || 'en'
                };

                const createdRecipe =
                    await apiClient.recipe.createRecipe(recipeForCreate);

                alert({
                    message: t('app.recipe.create-success'),
                    variant: 'success'
                });

                if (createdRecipe) {
                    // Allow navigation and reset the form on successful submission
                    allowNavigation();
                    formElement.reset();
                    setChangedFields([]);
                    safePush(`/recipe/${createdRecipe.id}`);
                }
            } catch (error: any) {
                setFormErrors({ server: 'auth.error.default' });
            } finally {
                setIsSubmitting(false);
            }
        },
        [alert, allowNavigation, isSubmitting, locale, safePush, t]
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
                isSidebarVisible && isTablet ? 'pr-16' : 'pr-0'
            )}
        >
            <form
                className={classNames(
                    'col-span-5 overflow-auto xl:col-span-2',
                    'w-full min-w-[240px] md:min-w-[480px] md:w-auto'
                )}
                onSubmit={handleSubmit}
            >
                <RecipeForm
                    onChange={handleFormChange}
                    errors={formErrors}
                    pending={isSubmitting}
                />
            </form>

            {/*-------------------------------------------------------------------------------------*/}
            {/*                                   MOBILE PREVIEW                                    */}
            {/*-------------------------------------------------------------------------------------*/}

            {isSidebarVisible && isMobile ? (
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

            {/*-------------------------------------------------------------------------------------*/}
            {/*                                   TABLET PREVIEW                                    */}
            {/*-------------------------------------------------------------------------------------*/}

            {isSidebarVisible && isTablet ? (
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
    rating: null,
    language: 'en',
    imageUrl: '',
    title: t('app.recipe.title'),
    difficulty: 'easy',
    portionSize: null,
    time: null,
    notes: null,
    ingredients: [],
    instructions: [],
    authorId: 0
});

async function uploadImage(
    data: FormData,
    alert: (a: AlertPayload) => void,
    t: (key: I18nMessage) => string
): Promise<string | null> {
    let image_url: string | null = null;

    try {
        const imageFile = data.get('recipe-image') as File;

        if (imageFile.size > 0) {
            const imageBytes = await fileToByteArray(imageFile);
            const response = await apiClient.file.uploadRecipeImage({
                bytes: imageBytes,
                fileName: `recipe-image-${generateUuid()}`
            });

            image_url = response.objectUrl;
        }
    } catch (error) {
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
}

async function extractFormData(
    data: FormData
): Promise<RecipeForCreateFormData> {
    //?--------------------------------------------------------------?//
    //                        HANDLE INGREDIENTS                      //
    //?--------------------------------------------------------------?//

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

    //?--------------------------------------------------------------?//
    //                       HANDLE INSTRUCTIONS                      //
    //?--------------------------------------------------------------?//

    const instructionKeys = Array.from(data.keys()).filter((key) =>
        key.startsWith('instruction')
    );

    const instructions = instructionKeys
        .map((key) => data.get(key) as string)
        .filter((instruction) => instruction.length > 0);

    //?--------------------------------------------------------------?//
    //                            THE REST...                         //
    //?--------------------------------------------------------------?//

    return {
        title: data.get('title') as string,
        difficulty: 'easy',
        portionSize: parseInt(data.get('portionSize') as string) || null,
        time: parseInt(data.get('time') as string) || null,
        imageUrl: null,
        notes: data.get('notes') as string,
        ingredients,
        instructions
    };
}
