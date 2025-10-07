'use client';

import React, { useCallback } from 'react';
import dynamic from 'next/dynamic';
import { IconButton, RecipeCard } from '@/client/components';
import type { RecipeCardProps } from '@/client/components/molecules/Card/types';
import { useModal, useLocale, useSnackbar } from '@/client/store';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { SortableItem, SortableKnob } from 'react-easy-sort';

const DeleteFromCookbookConfirmationModal = dynamic(
    () =>
        import(
            '@/client/components/molecules/Modal/DeleteFromCookbookConfirmationModal'
        ).then((mod) => mod.DeleteFromCookbookConfirmationModal),
    { ssr: false }
);

export type CookbookRecipeCardProps = Readonly<
    RecipeCardProps & {
        cookbookId: number;
        onRemoved?: (recipeId: number) => void;
    }
>;

export const CookbookRecipeCard: React.FC<CookbookRecipeCardProps> = ({
    cookbookId,
    onRemoved,
    ...recipeProps
}) => {
    const { openModal } = useModal();
    const { t } = useLocale();
    const { alert } = useSnackbar();
    const queryClient = useQueryClient();

    //|-----------------------------------------------------------------------------------------|//
    //?                                   MUTATION & HANDLERS                                   ?//
    //|-----------------------------------------------------------------------------------------|//

    const { mutate: removeRecipeFromCookbook, isPending } =
        chqc.cookbook.useRemoveRecipeFromCookbook({
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.cookbook.namespace]
                });

                alert({
                    message: t('app.success.remove-recipe' as any),
                    variant: 'success'
                });

                onRemoved?.(recipeProps.id);
            },
            onError: () => {
                alert({
                    message: t('app.error.default'),
                    variant: 'error'
                });
            }
        });

    const handleRemoveRecipe = useCallback(
        () =>
            removeRecipeFromCookbook({
                cookbookId,
                recipeId: recipeProps.id
            }),
        [removeRecipeFromCookbook, cookbookId, recipeProps.id]
    );

    //|-----------------------------------------------------------------------------------------|//
    //?                                          MODAL                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const getModalContent = useCallback(
        () => (close: () => void) => (
            <DeleteFromCookbookConfirmationModal
                recipeTitle={recipeProps.title}
                onDelete={handleRemoveRecipe}
                onCancel={close}
                close={close}
            />
        ),
        [recipeProps.title, handleRemoveRecipe]
    );

    const openDeleteModal = useCallback(() => {
        try {
            openModal(getModalContent(), {
                hideCloseButton: true
            });
        } catch (err) {
            alert({
                message: t('app.error.default'),
                variant: 'error'
            });
        }
    }, [openModal, getModalContent, alert, t]);

    //|-----------------------------------------------------------------------------------------|//
    //?                                         RENDER                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    return (
        <SortableItem>
            <div className="relative">
                <RecipeCard {...recipeProps} />

                <div className="absolute top-2 right-2 flex gap-1">
                    <IconButton
                        icon="cancel"
                        size={20}
                        onClick={openDeleteModal}
                        loading={isPending}
                        className="bg-white dark:bg-gray-800"
                        iconClassName="fill-red-500"
                    />
                    <SortableKnob>
                        <IconButton
                            icon="drag"
                            size={20}
                            disabled={isPending}
                            className="cursor-grab bg-white dark:bg-gray-800 disabled:cursor-not-allowed opacity-60"
                            iconClassName="fill-gray-500"
                        />
                    </SortableKnob>
                </div>
            </div>
        </SortableItem>
    );
};
