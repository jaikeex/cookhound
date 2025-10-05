'use client';

import {
    IconButton,
    RecipeImage,
    AddRecipeToCookbookModal
} from '@/client/components';
import { classNames } from '@/client/utils';
import React, { useCallback, useMemo } from 'react';
import { useAuth, useModal } from '@/client/store';
import { chqc } from '@/client/request/queryClient';

export type RecipeViewImageProps = Readonly<{
    alt: string | null;
    className?: string;
    src: string | null;
    recipeId: number;
    wrapperClassName?: string;
}>;

export const RecipeViewImage: React.FC<RecipeViewImageProps> = ({
    alt,
    className,
    src,
    recipeId,
    wrapperClassName
}) => {
    const { openModal } = useModal();
    const { user } = useAuth();

    const { data: cookbooks = [] } = chqc.cookbook.useCookbooksByUser(
        user?.id ?? 0
    );

    const options = useMemo(
        () =>
            cookbooks
                .map(({ id, title, recipes }) => ({
                    value: id.toString(),
                    label: title,
                    disabled: recipes?.some((r) => r.id === recipeId)
                }))
                .sort((a, b) => a.label.localeCompare(b.label))
                .sort((a, b) => (a.disabled ? 1 : b.disabled ? -1 : 0)),
        [cookbooks, recipeId]
    );

    const handleOpenModal = useCallback(() => {
        openModal((close) => (
            <AddRecipeToCookbookModal
                recipeId={recipeId}
                options={options}
                close={close}
            />
        ));
    }, [recipeId, openModal, options]);

    return (
        <div
            className={classNames(
                'relative min-w-max max-w-max',
                wrapperClassName
            )}
        >
            <RecipeImage
                alt={alt}
                className={classNames('', className)}
                src={src}
            />

            <IconButton
                icon="book"
                className="bg-white dark:bg-gray-800 absolute top-2 right-2"
                onClick={handleOpenModal}
            />
        </div>
    );
};
