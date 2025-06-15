'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { RecipeFormErrors } from '@/client/components';
import { RecipeForm } from '@/client/components';

import type {
    RecipeForCreatePayload,
    Ingredient,
    RecipeDTO
} from '@/common/types';
import { useLocale, useSnackbar } from '@/client/store';
import { DesktopRecipeViewTemplate } from '@/client/components/templates/Recipe/View/Desktop';
import apiClient from '@/client/request';
import {
    fileToByteArray,
    generateRandomId,
    lowerCaseFirstLetter,
    validateFormData
} from '@/client/utils';
import type { ObjectSchema } from 'yup';
import { array, number, object, string } from 'yup';
import { useRouter } from 'next/navigation';
import type { I18nMessage } from '@/client/locales';
import { useCreateRecipeStore } from '@/client/store/app-store/useCreateRecipeStore';

type DesktopRecipeCreateProps = Readonly<{
    className?: string;
}>;

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

const createRecipePlaceholder = (
    t: (key: I18nMessage) => string
): RecipeDTO => ({
    id: 0,
    rating: null,
    language: 'en',
    imageUrl: '/img/recipe-placeholder.png',
    title: t('app.recipe.title'),
    difficulty: 'easy',
    portionSize: null,
    time: null,
    notes: null,
    ingredients: [],
    instructions: [],
    authorId: 0
});

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

export const DesktopRecipeCreate: React.FC<DesktopRecipeCreateProps> = ({
    className
}) => {
    const { locale } = useLocale();
    const { alert } = useSnackbar();
    const { push } = useRouter();
    const { t } = useLocale();
    const [formErrors, setFormErrors] = useState<RecipeFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { recipeObject, setRecipeObject, updateRecipeObject } =
        useCreateRecipeStore();

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault(); // Prevent default form submission

            const formElement = event.currentTarget;
            const data = new FormData(formElement);
            let formData: RecipeForCreateFormData;

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
                setFormErrors({});

                const imageUrl = await uploadImage(data);
                if (imageUrl) {
                    formData.imageUrl = imageUrl;
                }

                const recipeForCreate: RecipeForCreatePayload = {
                    ...formData,
                    language: locale
                };

                const createdRecipe =
                    await apiClient.recipe.createRecipe(recipeForCreate);

                alert({
                    message: t('app.recipe.create-success'),
                    variant: 'success'
                });

                if (createdRecipe) {
                    // Only reset the form on successful submission
                    formElement.reset();
                    push(`/recipe/${createdRecipe.id}`);
                }
            } catch (error) {
                setFormErrors({ server: 'auth.error.default' });
            } finally {
                setIsSubmitting(false);
            }
        },
        [alert, locale, push, t]
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

            updateRecipeObject(name, newValue);
        },
        [updateRecipeObject]
    );

    useEffect(() => {
        setRecipeObject(createRecipePlaceholder(t));
    }, [setRecipeObject, t]);

    return (
        <div className={`${className} grid grid-rows-1 grid-cols-5`}>
            <form
                className={
                    'col-span-5 xl:col-span-2 overflow-auto min-w-[480px]'
                }
                onSubmit={handleSubmit}
            >
                <RecipeForm
                    onChange={handleFormChange}
                    errors={formErrors}
                    pending={isSubmitting}
                />
            </form>
            <div className={'col-span-3 px-2 hidden xl:block'}>
                {recipeObject ? (
                    <DesktopRecipeViewTemplate recipe={recipeObject} />
                ) : null}
            </div>
        </div>
    );
};

async function uploadImage(data: FormData): Promise<string | null> {
    const imageFile = data.get('recipe-image') as File;

    let image_url: string | null = null;

    if (imageFile.size > 0) {
        const imageBytes = await fileToByteArray(imageFile);
        const response = await apiClient.file.uploadRecipeImage({
            bytes: imageBytes,
            fileName: `recipe-image-${generateRandomId()}`
        });

        image_url = response.objectUrl;
    }

    return image_url;
}

async function extractFormData(
    data: FormData
): Promise<RecipeForCreateFormData> {
    // -------------------------------------------------------
    // Extract the ingredients array from the form data

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

    // -------------------------------------------------------

    // -------------------------------------------------------
    // Extract the instructions array from the form data

    const instructionKeys = Array.from(data.keys()).filter((key) =>
        key.startsWith('instruction')
    );

    const instructions = instructionKeys
        .map((key) => data.get(key) as string)
        .filter((instruction) => instruction.length > 0);

    // -------------------------------------------------------

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
