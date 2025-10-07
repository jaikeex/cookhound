'use client';

import { IconButton, RecipeImage } from '@/client/components';
import { classNames } from '@/client/utils';
import React, { useCallback, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useAuth, useModal } from '@/client/store';
import { chqc } from '@/client/request/queryClient';

const AddRecipeToCookbookModal = dynamic(
    () =>
        import(
            '@/client/components/molecules/Modal/AddRecipeToCookbookModal'
        ).then((mod) => mod.AddRecipeToCookbookModal),
    { ssr: false }
);

export type RecipeViewImageProps = Readonly<{
    alt: string | null;
    className?: string;
    src: string | null;
    recipeId: number;
    wrapperClassName?: string;
    priority?: boolean;
}>;

export const RecipeViewImage: React.FC<RecipeViewImageProps> = ({
    alt,
    className,
    src,
    recipeId,
    wrapperClassName,
    priority = false
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
                'relative md:min-w-max max-w-max',
                wrapperClassName
            )}
        >
            <RecipeImage
                alt={alt}
                className={classNames('', className)}
                src={src}
                priority={priority}
            />

            <IconButton
                icon="book"
                className="bg-white dark:bg-gray-800 absolute top-2 right-2"
                onClick={handleOpenModal}
            />
        </div>
    );
};
