'use client';

import {
    ButtonBase,
    BaseInput,
    Typography,
    IconButton
} from '@/client/components';
import { useLocale } from '@/client/store';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';

type CategoryHeaderProps = Readonly<{
    categoryName: string;
    ingredientCount: number;
    canRemove?: boolean;
    onRename: (oldName: string, newName: string) => void;
    onRemove?: () => void;
    existingCategoryNames?: string[];
}>;

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
    categoryName,
    canRemove = false,
    onRename,
    onRemove,
    existingCategoryNames = []
}) => {
    const { t } = useLocale();

    const [isEditing, setIsEditing] = useState(false);
    const [value, setValue] = useState(categoryName);
    const [error, setError] = useState<string | null>(null);

    const startEditing = useCallback(() => {
        setIsEditing(true);
        setError(null);
    }, []);

    const cancelEditing = useCallback(() => {
        setValue(categoryName);
        setIsEditing(false);
        setError(null);
    }, [categoryName]);

    const validateAndSave = useCallback(() => {
        const trimmed = value.trim();

        if (!trimmed) {
            setError(t('app.recipe.error.category-name-required'));
            return;
        }

        if (
            trimmed !== categoryName &&
            existingCategoryNames.includes(trimmed)
        ) {
            setError(t('app.recipe.error.category-name-duplicate'));
            return;
        }

        if (trimmed !== categoryName) {
            onRename(categoryName, trimmed);
        }

        setIsEditing(false);
        setError(null);
    }, [value, categoryName, existingCategoryNames, onRename, t]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                validateAndSave();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                cancelEditing();
            }
        },
        [validateAndSave, cancelEditing]
    );

    const handleValueChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value);
            setError(null);
        },
        []
    );

    useEffect(() => {
        setValue(categoryName);
    }, [categoryName]);

    return (
        <div className="pt-3 pb-4">
            <div className="flex items-center justify-between gap-4">
                {isEditing ? (
                    <div className="flex-1 relative">
                        <BaseInput
                            value={value}
                            onChange={handleValueChange}
                            onKeyDown={handleKeyDown}
                            placeholder={t(
                                'app.recipe.section-title-placeholder'
                            )}
                            autoFocus
                            className={error ? 'border-red-500' : ''}
                        />

                        {error && (
                            <Typography
                                variant="body-xs"
                                className="text-red-500 mt-1 absolute bottom-[-18px] left-0"
                            >
                                {error}
                            </Typography>
                        )}
                    </div>
                ) : (
                    <Typography
                        variant="heading-xs"
                        className="font-semibold cursor-pointer hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                        onClick={startEditing}
                    >
                        {categoryName}
                    </Typography>
                )}

                <div className="flex items-center gap-2">
                    {isEditing ? (
                        <>
                            <ButtonBase
                                size="sm"
                                className="h-8"
                                color="subtle"
                                icon="cancel"
                                onClick={cancelEditing}
                                outlined
                                aria-label={t('app.general.cancel')}
                            >
                                {t('app.general.cancel')}
                            </ButtonBase>
                        </>
                    ) : (
                        canRemove && (
                            <IconButton
                                size={24}
                                icon="cancel"
                                iconClassName="text-red-500"
                                onClick={onRemove}
                                aria-label={t('app.recipe.remove-section')}
                            />
                        )
                    )}

                    <ButtonBase
                        size="sm"
                        className="min-w-16 h-8"
                        color={isEditing ? 'secondary' : 'subtle'}
                        outlined
                        onClick={isEditing ? validateAndSave : startEditing}
                        aria-label={
                            isEditing
                                ? t('app.general.save')
                                : t('app.recipe.rename-section')
                        }
                    >
                        {isEditing
                            ? t('app.general.save')
                            : t('app.recipe.rename-section')}
                    </ButtonBase>
                </div>
            </div>
        </div>
    );
};
