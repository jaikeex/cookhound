'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { useScreenSize, useUnsavedChangesWarning } from '@/client/hooks';
import { useSnackbar, useLocale, useCreateRecipeStore } from '@/client/store';
import {
    recipeFormSchema,
    extractFormData,
    createRecipePlaceholder,
    fileToByteArray,
    lowerCaseFirstLetter,
    validateFormData,
    generateUuid
} from '@/client/utils';
import type {
    Ingredient,
    RecipeDTO,
    RecipeForCreatePayload
} from '@/common/types';
import type { I18nMessage } from '@/client/locales';
import type { RecipeFormErrors } from '@/client/components';
import type { RecipeFormMode } from '@/client/types/core';
import { revalidateRouteCache } from '@/common/utils';
import { DEFAULT_LOCALE } from '@/common/constants';

export interface UseRecipeFormControllerProps {
    //When in edit mode, this existing recipe will pre-fill the form.
    initialRecipe?: RecipeDTO | null;
    mode: RecipeFormMode;
}

export const useRecipeFormController = ({
    mode,
    initialRecipe = null
}: UseRecipeFormControllerProps) => {
    const isEdit = mode === 'edit';

    //~-----------------------------------------------------------------------------------------~//
    //$                                      STATE & SETUP                                      $//
    //~-----------------------------------------------------------------------------------------~//

    const { t, locale } = useLocale();
    const { alert } = useSnackbar();
    const { isTablet, isMobile } = useScreenSize();
    const queryClient = useQueryClient();

    const [changedFields, setChangedFields] = useState<string[]>([]);
    const [formErrors, setFormErrors] = useState<RecipeFormErrors>({});

    const { recipeObject, setRecipeObject, updateRecipeObject } =
        useCreateRecipeStore();

    const formRef = useRef<HTMLFormElement>(null);

    const { mutateAsync: uploadImageMutation, isPending: isUploadingImage } =
        chqc.file.useUploadRecipeImage();

    const { mutate: submitRecipe, isPending } = isEdit
        ? chqc.recipe.useUpdateRecipe({
              onSuccess: (recipe) => handleSubmitSuccess(recipe as RecipeDTO),
              onError: (error) => {
                  setFormErrors({
                      server:
                          (error?.message as I18nMessage) || 'app.error.default'
                  });
              }
          })
        : chqc.recipe.useCreateRecipe({
              onSuccess: (recipe) => handleSubmitSuccess(recipe as RecipeDTO),
              onError: (error) => {
                  setFormErrors({
                      server:
                          (error?.message as I18nMessage) || 'app.error.default'
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

    //~-----------------------------------------------------------------------------------------~//
    //$                                      UPLOAD IMAGE                                       $//
    //~-----------------------------------------------------------------------------------------~//

    const uploadRecipeImage = useCallback(
        async (data: FormData): Promise<string | null> => {
            let image_url: string | null = null;

            try {
                const imageFile = data.get('recipe-image') as File;

                if (imageFile && imageFile.size > 0) {
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
            }

            return image_url;
        },
        [alert, t, uploadImageMutation]
    );

    //~-----------------------------------------------------------------------------------------~//
    //$                                       SUBMISSION                                        $//
    //~-----------------------------------------------------------------------------------------~//

    const handleSubmitSuccess = useCallback(
        async (recipe: RecipeDTO) => {
            await revalidateRouteCache(`/recipe/${recipe.displayId}`);

            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.queryKey[0] === QUERY_KEYS.recipe.namespace
            });

            alert({
                message: isEdit
                    ? t('app.recipe.edit-success' as I18nMessage)
                    : t('app.recipe.create-success' as I18nMessage),
                variant: 'success'
            });

            allowNavigation();
            safePush(`/recipe/${recipe.displayId}`);
        },
        [alert, allowNavigation, isEdit, queryClient, safePush, t]
    );

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            const formElement = event.currentTarget;
            const data = new FormData(formElement);

            let formData: any;

            try {
                formData = await extractFormData(data);

                const validationErrors: RecipeFormErrors =
                    await validateFormData(formData, recipeFormSchema);

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    return;
                }
            } catch (err) {
                setFormErrors({ server: 'auth.error.default' });
                return;
            }

            setFormErrors({});

            const imageUrl = await uploadRecipeImage(data);
            if (imageUrl) {
                formData.imageUrl = imageUrl;
            }

            const payload: RecipeForCreatePayload = {
                ...formData,
                language: locale || DEFAULT_LOCALE
            };

            if (isEdit && initialRecipe) {
                (submitRecipe as any)({
                    id: `${initialRecipe.id}`,
                    recipe: payload
                });
            } else {
                (submitRecipe as any)(payload);
            }
        },
        [initialRecipe, isEdit, locale, submitRecipe, uploadRecipeImage]
    );

    //~-----------------------------------------------------------------------------------------~//
    //$                                      FIELD CHANGE                                       $//
    //~-----------------------------------------------------------------------------------------~//

    const handleFormChange = useCallback(
        (name: string, value: any) => {
            let newValue: any = value;

            if (name === 'ingredients' && value) {
                newValue = value.map((ingredient: Ingredient) => ({
                    quantity: ingredient?.quantity || null,
                    id: null,
                    name: lowerCaseFirstLetter(ingredient?.name)
                }));
            }

            if (name === 'title' && (!value || value.length === 0)) {
                newValue = t('app.recipe.title');
            }

            updateRecipeObject(name, newValue);

            if (!changedFields.includes(name) && newValue?.length > 0) {
                setChangedFields((prev) => [...prev, name]);
            }
        },
        [changedFields, t, updateRecipeObject]
    );

    /**
     * This could be done by simply checking if the recipeObject fields are not empty.
     * However, the intention here was to keep the sidebar visible when the user deletes
     * the content of some of the required fields after already changing them.
     * The preview jumping from visible to hidden is confusing as fuck.
     */
    const isSidebarVisible =
        isEdit ||
        !!(
            recipeObject &&
            changedFields.length >= 3 &&
            changedFields.includes('ingredients') &&
            changedFields.includes('instructions') &&
            changedFields.includes('title')
        );

    const controllerReturn = {
        recipeObject,
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
        handleClosePreview
    } as const;

    //~-----------------------------------------------------------------------------------------~//
    //$                                         EFFECTS                                         $//
    //~-----------------------------------------------------------------------------------------~//

    useEffect(() => {
        if (isEdit && initialRecipe) {
            // If the recipe in the store is different from the one for this page,
            // update the store. This handles navigating between different edit pages.
            if (recipeObject?.id !== initialRecipe.id) {
                setRecipeObject(initialRecipe);
                setChangedFields([]);
            }
        } else if (!isEdit) {
            // On the create page, if the store holds a real recipe from a previous
            // session (identifiable by it having an ID), reset it.
            if (recipeObject === null || recipeObject.id) {
                setRecipeObject(
                    createRecipePlaceholder(
                        locale,
                        t as unknown as (key: string) => string
                    )
                );
                setChangedFields([]);
            }
        }
    }, [
        initialRecipe,
        isEdit,
        locale,
        setRecipeObject,
        t,
        recipeObject?.id,
        recipeObject
    ]);

    return controllerReturn;
};
