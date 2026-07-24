'use client';

import { DeleteRecipeConfirmationModal } from '@/client/components/organisms/Modal/DeleteRecipeConfirmationModal';
import {
    Dropdown,
    type DropdownItem
} from '@/client/components/organisms/Dropdown';
import { IconButton } from '@/client/components/atoms/Button/Icon';
import { RecipeCard } from '@/client/components/molecules/Card/Recipe';
import React, { useCallback, useMemo } from 'react';
import type { RecipeCardProps } from '@/client/components/molecules/Card/types';
import { chqc, QUERY_KEYS } from '@/client/data';
import { useQueryClient } from '@tanstack/react-query';
import { useModal, useSnackbar } from '@/client/store';
import { useRouter } from 'next/navigation';
import { classNames } from '@/client/utils';
import { ROUTES } from '@/common/constants';
import { t } from '@/client/locales';

export const RecipeWithHandling: React.FC<RecipeCardProps> = ({
    id,
    displayId,
    title,
    imageUrl,
    rating,
    time,
    portionSize,
    index = 0,
    flags
}) => {
    const queryClient = useQueryClient();
    const { alert } = useSnackbar();
    const { openModal } = useModal();
    const router = useRouter();

    const isFlagged = useMemo(
        () => flags?.some((flag) => flag.active) ?? false,
        [flags]
    );

    const { mutate: deleteRecipe, isPending } = chqc.recipe.useDeleteRecipe({
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: [QUERY_KEYS.recipe.namespace]
            });

            alert({
                message: t('auth.success.delete-recipe'),
                variant: 'success'
            });
        },
        onError: () => {
            alert({
                message: t('app.error.default'),
                variant: 'error'
            });
        }
    });

    const handleDeleteRecipe = useCallback(
        () => deleteRecipe(id),
        [deleteRecipe, id]
    );

    const getModalContent = useCallback(
        () => (close: () => void) => {
            return (
                <DeleteRecipeConfirmationModal
                    recipeTitle={title}
                    onDelete={handleDeleteRecipe}
                    onCancel={close}
                    close={close}
                />
            );
        },
        [title, handleDeleteRecipe]
    );

    const handleOpenDeleteRecipeModal = useCallback(() => {
        openModal(getModalContent(), {
            hideCloseButton: true
        });
    }, [openModal, getModalContent]);

    const items: DropdownItem[] = useMemo(() => {
        const editAndDelete: DropdownItem[] = [
            {
                icon: 'edit',
                label: t('app.general.edit'),
                onClick: () => {
                    router.push(ROUTES.recipe.edit(displayId));
                }
            },
            {
                icon: 'cancel',
                label: t('app.general.delete'),
                onClick: handleOpenDeleteRecipeModal,
                color: 'danger'
            }
        ];

        if (!isFlagged) {
            return editAndDelete;
        }

        return [
            {
                icon: 'flag',
                label: t('recipe.flag.menu.view-details'),
                onClick: () => {
                    router.push(ROUTES.recipe.detail(displayId, title));
                },
                color: 'danger'
            },
            ...editAndDelete
        ];
    }, [router, displayId, title, handleOpenDeleteRecipeModal, isFlagged]);

    return (
        <div className="relative">
            <RecipeCard
                id={id}
                displayId={displayId}
                title={title}
                imageUrl={imageUrl}
                rating={rating}
                time={time ?? 0}
                portionSize={portionSize ?? 0}
                index={index}
            />
            <Dropdown
                items={items}
                className="absolute! top-2 right-2"
                position="left"
                menuClassName={isFlagged ? 'min-w-40' : ''}
            >
                <IconButton
                    icon={isFlagged ? 'flag' : 'threeDots'}
                    size={20}
                    className={classNames(
                        'bg-white dark:bg-gray-800',
                        isFlagged && 'text-danger'
                    )}
                    loading={isPending}
                />
            </Dropdown>
        </div>
    );
};
