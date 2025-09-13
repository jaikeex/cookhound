'use client';

import React, { useCallback } from 'react';
import {
    Divider,
    ImageInput,
    IngredientsListCreate,
    InputError,
    InstructionsListCreate,
    NumberInput,
    Submit,
    TagSelection,
    Textarea,
    TextInput,
    Typography
} from '@/client/components';
import { useAuth, useLocale } from '@/client/store';
import type { Ingredient, RecipeDTO, RecipeTagDTO } from '@/common/types';
import type { I18nMessage } from '@/client/locales';
import type { RecipeFormMode } from '@/client/types/core';
// import { useFormStatus } from 'react-dom';

type RecipeFormProps = Readonly<{
    className?: string;
    errors?: RecipeFormErrors;
    mode: RecipeFormMode;
    onChange?: (name: string, value: any) => void;
    pending?: boolean;
    defaultValues?: RecipeDTO | null;
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
    pending,
    defaultValues,
    mode
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
            let value: string | number = (e.target as HTMLInputElement).value;

            if (name === 'portionSize' || name === 'time') {
                value = Number(value) || 0;
            }

            if (onChange) {
                onChange && onChange(name, value);
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

    const handleTagSelection = useCallback(
        (tags: RecipeTagDTO[]) => {
            onChange && onChange('tags', tags);
        },
        [onChange]
    );

    return (
        <div className={`space-y-4 md:px-8 overflow-x-hidden ${className}`}>
            <ImageInput
                onUpload={handleImageChange}
                name={'recipe-image'}
                showPreview
                defaultImageUrl={defaultValues?.imageUrl}
            />

            {/* Hidden field to preserve the default imageUrl when no new image is uploaded */}
            {defaultValues?.imageUrl && (
                <input
                    type="hidden"
                    name="imageUrl"
                    value={defaultValues.imageUrl}
                />
            )}

            <TextInput
                defaultValue={defaultValues?.title}
                id={'recipe-title'}
                label={t('app.recipe.title')}
                name={'title'}
                onChange={handleInputChange('title')}
                onKeyDown={handleInputKeyPress('recipe-portionSize')}
                error={t(errors?.title)}
            />

            <Divider className="md:hidden" />

            <div className={'flex flex-col gap-4 md:grid md:grid-cols-2'}>
                <NumberInput
                    className={'mt-auto'}
                    defaultValue={defaultValues?.portionSize}
                    id={'recipe-portionSize'}
                    label={t('app.recipe.servings')}
                    name={'portionSize'}
                    max={100}
                    allowDecimals={false}
                    onChange={handleInputChange('portionSize')}
                    onKeyDown={handleInputKeyPress('recipe-time')}
                />
                <NumberInput
                    defaultValue={defaultValues?.time}
                    id={'recipe-time'}
                    label={t('app.recipe.preparation-time')}
                    name={'time'}
                    max={9999}
                    allowDecimals={false}
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

            <IngredientsListCreate
                onChange={handleIngredientsChange}
                defaultIngredients={defaultValues?.ingredients}
            />

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

            <InstructionsListCreate
                defaultInstructions={defaultValues?.instructions}
                onChange={handleInstructionsChange}
            />

            <Divider />

            <Textarea
                defaultValue={defaultValues?.notes}
                id={'notes'}
                label={t('app.recipe.notes')}
                name={'notes'}
                onChange={handleInputChange('notes')}
            />

            <TagSelection
                defaultTags={defaultValues?.tags}
                onConfirm={handleTagSelection}
            />

            <Submit
                className="min-w-40 !mt-6 mx-auto w-full"
                disabled={pending || !isLoggedin}
                pending={pending}
                label={
                    mode === 'create'
                        ? t('app.recipe.create')
                        : t('app.recipe.update')
                }
            />

            {errors?.server ? (
                <Typography variant={'error'} align={'center'}>
                    {t(errors.server)}
                </Typography>
            ) : null}
        </div>
    );
};
