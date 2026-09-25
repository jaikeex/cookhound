'use client';

import React, { useCallback, useMemo, useState } from 'react';
import type { ModalProps } from '@/client/components/organisms/Modal/types';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { Loader } from '@/client/components/atoms/Loader';
import { Select } from '@/client/components/molecules/Form/Select';
import { Typography } from '@/client/components/atoms/Typography';
import { useAuth, useModal, useSnackbar } from '@/client/store';
import { chqc, QUERY_KEYS } from '@/client/data';
import { useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { t } from '@/client/locales';

const CreateCookbookModal = dynamic(
    () =>
        import('@/client/components/organisms/Modal/CreateCookbookModal').then(
            (mod) => mod.CreateCookbookModal
        ),
    { ssr: false }
);

//~---------------------------------------------------------------------------------------------~//
//$                                            TYPES                                            $//
//~---------------------------------------------------------------------------------------------~//

export type AddRecipeToCookbookModalProps = Readonly<{
    recipeId: number;
}> &
    ModalProps;

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export const AddRecipeToCookbookModal: React.FC<
    AddRecipeToCookbookModalProps
> = ({ recipeId, close }) => {
    const { alert } = useSnackbar();
    const { openModal } = useModal();
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const { data: cookbooks = [], isLoading } =
        chqc.cookbook.useCookbooksByUser(user?.id ?? 0);

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

    const [selectedCookbookId, setSelectedCookbookId] = useState<string | null>(
        null
    );

    const { mutate: addRecipe, isPending } =
        chqc.cookbook.useAddRecipeToCookbook({
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.cookbook.namespace]
                });

                alert({
                    message: t('app.cookbook.add-recipe-success'),
                    variant: 'success'
                });
                close();
            }
        });

    const handleApply = useCallback(() => {
        if (!selectedCookbookId) return;

        addRecipe({ cookbookId: Number(selectedCookbookId), recipeId });
    }, [selectedCookbookId, addRecipe, recipeId]);

    const handleSelectChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setSelectedCookbookId(e.target.value);
        },
        []
    );

    const handleClose = useCallback(() => {
        close();
    }, [close]);

    const onCreateCookbook = useCallback(
        (cookbookId: number) => {
            addRecipe(
                { cookbookId, recipeId },
                {
                    onSuccess: () => {
                        queryClient.invalidateQueries({
                            queryKey: [QUERY_KEYS.cookbook.namespace]
                        });

                        alert({
                            message: t('app.cookbook.create-and-add-success'),
                            variant: 'success'
                        });

                        close();
                    }
                }
            );
        },
        [addRecipe, recipeId, queryClient, alert, close]
    );

    const handleCreateCookbook = useCallback(() => {
        openModal((closeCreateModal) => (
            <CreateCookbookModal
                close={closeCreateModal}
                onCreate={onCreateCookbook}
            />
        ));
    }, [openModal, onCreateCookbook]);

    if (isLoading) {
        return (
            <div className="flex justify-center px-16 py-8">
                <Loader />
            </div>
        );
    }

    // Empty state when user has no cookbooks
    if (options.length === 0) {
        return (
            <div className="flex flex-col w-full h-full max-h-[85dvh] md:max-h-[70dvh] max-w-[80dvw] md:max-w-[60dvw] xl:max-w-[40dvw] px-4">
                <Typography as="h2" variant="heading-md">
                    {t('app.cookbook.no-cookbooks-title')}
                </Typography>

                <Typography variant="body-sm" className="my-4">
                    {t('app.cookbook.no-cookbooks-description')}
                </Typography>

                <div className="shrink-0 flex w-full gap-3 mt-4 pt-4">
                    <ButtonBase
                        onClick={handleClose}
                        color="subtle"
                        outlined
                        size="md"
                        className="w-full"
                    >
                        {t('app.general.cancel')}
                    </ButtonBase>

                    <ButtonBase
                        color="primary"
                        onClick={handleCreateCookbook}
                        size="md"
                        className="w-full"
                    >
                        {t('app.cookbook.create-first')}
                    </ButtonBase>
                </div>
            </div>
        );
    }

    // Normal state with cookbook selection
    return (
        <div className="flex flex-col w-full h-full max-h-[85dvh] md:max-h-[70dvh] max-w-[80dvw] md:max-w-[60dvw] xl:max-w-[40dvw] px-4">
            <Typography as="h2" variant="heading-md">
                {t('app.cookbook.select-title')}
            </Typography>

            <Typography variant="body-sm" className="my-2">
                {t('app.cookbook.select-description')}
            </Typography>

            <Select
                id="cookbookId"
                name="cookbookId"
                label={t('app.cookbook.select-label')}
                options={options}
                placeholder={t('app.cookbook.select-placeholder')}
                defaultValue={undefined}
                onChange={handleSelectChange}
            />

            <div className="shrink-0 flex w-full gap-3 mt-4 pt-4">
                <ButtonBase
                    onClick={handleClose}
                    color="subtle"
                    outlined
                    size="md"
                    className="w-full"
                >
                    {t('app.general.cancel')}
                </ButtonBase>

                <ButtonBase
                    color="primary"
                    onClick={handleApply}
                    size="md"
                    disabled={!selectedCookbookId || isPending}
                    className="w-full"
                >
                    {t('app.general.confirm')}
                </ButtonBase>
            </div>
        </div>
    );
};
