'use client';

import { useCallback, useEffect, useState } from 'react';
import type { RecipeFormErrors } from '@/client/components';
import type {
    RecipeForCreatePayload,
    Ingredient,
    RecipeDTO
} from '@/common/types';
import { useLocale, useSnackbar } from '@/client/store';
import apiClient from '@/client/request';
import {
    fileToByteArray,
    generateRandomId,
    lowerCaseFirstLetter,
    validateFormData
} from '@/client/utils';
import { useCreateRecipeStore } from '@/client/store/app-store/useCreateRecipeStore';
import { useUnsavedChangesWarning } from '@/client/hooks';
import type { I18nMessage } from '@/client/locales';
import type { RecipeForCreateFormData } from './types';
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

//~---------------------------------------------------------------------------------------------~//
//$                                            HOOK                                             $//
//~---------------------------------------------------------------------------------------------~//

export const useCreateRecipe = () => {
    const { locale } = useLocale();
    const { alert } = useSnackbar();
    const { t } = useLocale();

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

                const imageUrl = await uploadImage(data);
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

    useEffect(() => {
        setRecipeObject(createRecipePlaceholder(t));
    }, [setRecipeObject, t]);

    return {
        formErrors,
        isSubmitting,
        changedFields,
        recipeObject,
        handleSubmit,
        handleFormChange
    };
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

async function uploadImage(data: FormData): Promise<string | null> {
    let image_url: string | null = null;

    try {
        const imageFile = data.get('recipe-image') as File;

        if (imageFile.size > 0) {
            const imageBytes = await fileToByteArray(imageFile);
            const response = await apiClient.file.uploadRecipeImage({
                bytes: imageBytes,
                fileName: `recipe-image-${generateRandomId()}`
            });

            image_url = response.objectUrl;
        }
    } catch (error) {
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
