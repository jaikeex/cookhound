'use client';

import React, { useCallback } from 'react';
import {
    Divider,
    ImageInput,
    IngredientsListCreate,
    InputError,
    InstructionsListCreate,
    Submit,
    Textarea,
    TextInput,
    Typography
} from '@/client/components';
import { useAuth, useLocale } from '@/client/store';
import type { Ingredient } from '@/common/types';
import type { I18nMessage } from '@/client/locales';
// import { useFormStatus } from 'react-dom';

type RecipeFormProps = Readonly<{
    className?: string;
    errors?: RecipeFormErrors;
    onChange?: (name: string, value: any) => void;
    pending?: boolean;
}>;

export type RecipeFormErrors = {
    title?: I18nMessage;
    ingredients?: I18nMessage;
    instructions?: I18nMessage;
    server?: I18nMessage;
};

export const RecipeForm: React.FC<RecipeFormProps> = ({
    className,
    errors,
    onChange,
    pending
}) => {
    // This hook call does nothing at the moment as it only works with react server actions.
    // It is left here for reference and to possibly inspire another solution in the future :D
    // const { pending } = useFormStatus();
    const { authResolved, user } = useAuth();
    const { t } = useLocale();
    const isLoggedin = authResolved && !!user;

    const handleImageChange = useCallback(
        (file: File) => {
            const imageUrl = URL.createObjectURL(file);
            onChange && onChange('imageUrl', imageUrl);
        },
        [onChange]
    );

    const handleInputChange = useCallback(
        (name: string) => (e: React.ChangeEvent) => {
            if (onChange) {
                const value = (e.target as HTMLInputElement).value;
                onChange(name, value);
            }
        },
        [onChange]
    );

    const handleIngredientsChange = useCallback(
        (ingredients: Ingredient[]) => {
            onChange && onChange('ingredients', ingredients);
        },
        [onChange]
    );

    const handleInstructionsChange = useCallback(
        (instructions: string[]) => {
            onChange && onChange('instructions', instructions);
        },
        [onChange]
    );

    const handleInputKeyPress = useCallback(
        (nextId: string) => (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault(); // Prevent form submission
                const portionSizeInput = document.getElementById(nextId);
                portionSizeInput?.focus();
            }
        },
        []
    );

    return (
        <div className={`space-y-4 px-4 md:px-8 ${className}`}>
            <ImageInput
                onUpload={handleImageChange}
                name={'recipe-image'}
                showPreview
            />

            <TextInput
                id={'recipe-title'}
                label={t('app.recipe.title')}
                name={'title'}
                onChange={handleInputChange('title')}
                onKeyDown={handleInputKeyPress('recipe-portionSize')}
                error={t(errors?.title)}
            />

            <div className={'grid grid-cols-2 gap-4'}>
                <TextInput
                    className={'mt-auto'}
                    id={'recipe-portionSize'}
                    label={t('app.recipe.servings')}
                    name={'portionSize'}
                    type={'number'}
                    onChange={handleInputChange('portionSize')}
                    onKeyDown={handleInputKeyPress('recipe-time')}
                />
                <TextInput
                    id={'recipe-time'}
                    label={t('app.recipe.preparation-time')}
                    name={'time'}
                    type={'number'}
                    onChange={handleInputChange('time')}
                    onKeyDown={handleInputKeyPress('ingredient-quantity-0')}
                />
            </div>

            <Divider />

            <div className={'flex items-center justify-between'}>
                <Typography variant={'heading-sm'}>
                    {t('app.recipe.ingredients')}
                </Typography>
                <InputError
                    className={'relative'}
                    message={t(errors?.ingredients)}
                />
            </div>

            <IngredientsListCreate onChange={handleIngredientsChange} />

            <Divider />

            <div className={'flex items-center justify-between'}>
                <Typography variant={'heading-sm'}>
                    {t('app.recipe.instructions')}
                </Typography>
                <InputError
                    className={'relative'}
                    message={t(errors?.instructions)}
                />
            </div>

            <InstructionsListCreate onChange={handleInstructionsChange} />

            <Divider />

            <Textarea
                id={'notes'}
                label={t('app.recipe.notes')}
                name={'notes'}
                onChange={handleInputChange('notes')}
            />

            <Submit
                className="min-w-40 !mt-6 mx-auto w-full"
                disabled={pending || !isLoggedin}
                pending={pending}
                label={t('app.recipe.create')}
            />

            {errors?.server ? (
                <Typography variant={'error'} align={'center'}>
                    {t(errors.server)}
                </Typography>
            ) : null}
        </div>
    );
};
