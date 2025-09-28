'use client';

import React, { useCallback, useState } from 'react';
import type { ModalProps } from '@/client/components/molecules/Modal/types';
import {
    ButtonBase,
    Select,
    Typography,
    type SelectOption
} from '@/client/components';
import { useLocale, useSnackbar } from '@/client/store';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { useQueryClient } from '@tanstack/react-query';

//~---------------------------------------------------------------------------------------------~//
//$                                            TYPES                                            $//
//~---------------------------------------------------------------------------------------------~//

export type AddRecipeToCookbookModalProps = Readonly<{
    recipeId: number;
    options: SelectOption[];
}> &
    ModalProps;

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export const AddRecipeToCookbookModal: React.FC<
    AddRecipeToCookbookModalProps
> = ({ recipeId, options, close }) => {
    const { t } = useLocale();
    const { alert } = useSnackbar();
    const queryClient = useQueryClient();

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
            },
            onError: () => {
                alert({ message: t('app.error.default'), variant: 'error' });
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

    return (
        <div className="flex flex-col w-full h-full max-h-[85dvh] md:max-h-[70dvh] max-w-[80dvw] md:max-w-[60dvw] xl:max-w-[40dvw] px-4">
            <Typography variant="heading-md">
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

            <div className="flex-shrink-0 flex w-full gap-3 mt-4 pt-4">
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
