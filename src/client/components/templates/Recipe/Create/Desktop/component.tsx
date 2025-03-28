'use client';

import React, { useCallback, useState } from 'react';
import type { RecipeFormErrors } from '@/client/components';
import { RecipeForm } from '@/client/components';
import type { SubmitHandler } from '@/client/components/organisms/Form/types';
import type { RecipeForCreate } from '@/client/services';
import { useLocale, useSnackbar } from '@/client/store';
import type { Ingredient, Recipe } from '@/client/types';
import { DesktopRecipeViewTemplate } from '@/client/components/templates/Recipe/View/Desktop';
import { fileService, recipeService } from '@/client/services';
import {
    fileToByteArray,
    generateRandomId,
    validateFormData
} from '@/client/utils';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import type { ObjectSchema } from 'yup';
import { array, number, object, string } from 'yup';
import { useRouter } from 'next/navigation';
import type { I18nMessage } from '@/client/locales';

type DesktopRecipeCreateProps = Readonly<{
    className?: string;
}>;

type RecipeForCreateFormData = {
    title: string;
    difficulty: string;
    portion_size: number | null;
    time: number | null;
    image_url: string | null;
    notes: string | null;
    ingredients: Omit<Ingredient, 'id'>[];
    instructions: string[];
};

const createRecipePlaceholder = (t: (key: I18nMessage) => string): Recipe => ({
    id: 1,
    language: 'en',
    rating: 0,
    author_id: 1000,
    created_at: '2021-09-01T00:00:00Z',
    updated_at: '2021-09-01T00:00:00Z',
    image_url: '/img/recipe-placeholder.png',
    title: t('app.recipe.title'),
    difficulty: 'easy',
    portion_size: null,
    time: null,
    notes: null,
    ingredients: [],
    instructions: []
});

export const createRecipeSchema: ObjectSchema<RecipeForCreateFormData> = object(
    {
        title: string().required('app.recipe.error.title-required'),
        difficulty: string().required(),
        portion_size: number().nullable().defined(),
        time: number().nullable().defined(),
        image_url: string().nullable().defined(),
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
    const [recipeForDisplay, setRecipeForDisplay] = useState<Recipe>(
        createRecipePlaceholder(t)
    );

    const handleSubmit: SubmitHandler = useCallback(
        async (data: FormData) => {
            let formData: RecipeForCreateFormData;

            try {
                formData = await extractFormData(data);

                const validationErrors: RecipeFormErrors =
                    await validateFormData(formData, createRecipeSchema);

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    return;
                }
            } catch (error) {
                setFormErrors({ server: 'auth.error.default' });
                return;
            }

            try {
                setFormErrors({});
                const recipeForCreate: RecipeForCreate = {
                    ...formData,
                    language: locale
                };

                const createdRecipe =
                    await recipeService.createRecipe(recipeForCreate);

                console.log(createdRecipe);

                alert({
                    message: t('app.recipe.create-success'),
                    variant: 'success'
                });

                if (createdRecipe) {
                    push(`/recipe/${createdRecipe.id}`);
                }
            } catch (error) {
                setFormErrors({ server: 'auth.error.default' });
            }
        },
        [alert, locale, push, t]
    );

    const handleFormChange = useCallback((name: string, value: any) => {
        setRecipeForDisplay((prev) => ({
            ...prev,
            [name]: value
        }));
    }, []);

    return (
        <div className={`${className} grid grid-cols-5 gap-10`}>
            <form className={'col-span-2 overflow-auto'} action={handleSubmit}>
                <RecipeForm onChange={handleFormChange} errors={formErrors} />
            </form>
            <div className={'col-span-3 px-12'}>
                <DesktopRecipeViewTemplate recipe={recipeForDisplay} />
            </div>
        </div>
    );
};

async function extractFormData(
    data: FormData
): Promise<RecipeForCreateFormData> {
    // -------------------------------------------------------
    // Upload the image file to Google Cloud Storage and get the URL

    const imageFile = data.get('recipe-image') as File;

    let image_url: string | null = null;

    console.log('Image File: ', imageFile);

    if (imageFile.size > 0) {
        const imageBytes = await fileToByteArray(
            data.get('recipe-image') as File
        );
        const response = await fileService.uploadFile({
            bytes: imageBytes,
            file_name: `recipe-image-${generateRandomId()}`,
            bucket:
                ENV_CONFIG_PUBLIC.GOOGLE_STORAGE_BUCKET_RECIPE_IMAGES ||
                'cookhound-recipe-images',
            content_type: 'image/webp'
        });

        image_url = response.object_url;
    }

    // -------------------------------------------------------

    // -------------------------------------------------------
    // Extract the ingredients array from the form data

    const ingredientKeys = Array.from(data.keys()).filter((key) =>
        key.startsWith('ingredient-name')
    );

    const ingredients = ingredientKeys
        .map((name) => {
            const index = name.split('-')[2];
            return {
                name: data.get(`ingredient-name-${index}`) as string,
                quantity: data.get(`ingredient-quantity-${index}`) as string
            };
        })
        .filter(
            (ingredient) =>
                ingredient.name.length > 0 && ingredient.quantity.length > 0
        );

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
        portion_size: parseInt(data.get('portion_size') as string) || null,
        time: parseInt(data.get('time') as string) || null,
        image_url,
        notes: data.get('notes') as string,
        ingredients,
        instructions
    };
}
