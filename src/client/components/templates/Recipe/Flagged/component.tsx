'use client';

import React, { useCallback, useMemo } from 'react';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { Icon } from '@/client/components/atoms/Icons';
import { Typography } from '@/client/components/atoms/Typography';
import { useAuth, useModal } from '@/client/store';
import { useRouter } from 'next/navigation';
import type { Recipe } from '@/common/types';
import type { RecipeFlagReason } from '@/common/constants';
import { bucketForReason, RecipeFlagBucket } from '@/client/constants';
import { DeleteRecipeConfirmationModal } from '@/client/components/organisms/Modal/DeleteRecipeConfirmationModal';
import { chqc, QUERY_KEYS } from '@/client/data';
import { useQueryClient } from '@tanstack/react-query';
import { useSnackbar } from '@/client/store';
import { RecipeFlagAppealModal } from '@/client/components/organisms/Modal/RecipeFlagAppealModal';
import { ROUTES } from '@/common/constants';
import { t } from '@/client/locales';

export type FlaggedAuthorTemplateProps = Readonly<{
    recipe: Recipe;
}>;

export const FlaggedAuthorTemplate: React.FC<FlaggedAuthorTemplateProps> = ({
    recipe
}) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { openModal } = useModal();
    const { alert } = useSnackbar();
    const { user } = useAuth();

    const activeFlag = useMemo(
        () => recipe.flags?.find((flag) => flag.active) ?? null,
        [recipe.flags]
    );

    const reason = (activeFlag?.reason as RecipeFlagReason) ?? null;
    const bucket = reason
        ? bucketForReason(reason)
        : RecipeFlagBucket.CONTENT_POLICY;

    const { mutate: deleteRecipe, isPending: isDeleting } =
        chqc.recipe.useDeleteRecipe({
            onSuccess: () => {
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEYS.recipe.namespace]
                });

                alert({
                    message: t('auth.success.delete-recipe'),
                    variant: 'success'
                });

                router.push(user ? ROUTES.user.detail(user.id) : ROUTES.home);
            }
        });

    const handleEdit = useCallback(() => {
        router.push(ROUTES.recipe.edit(recipe.displayId));
    }, [router, recipe.displayId]);

    const handleAppeal = useCallback(() => {
        if (!activeFlag) return;

        openModal(
            (close) => (
                <RecipeFlagAppealModal
                    recipeId={recipe.id}
                    flagId={activeFlag.id}
                    close={close}
                />
            ),
            { hideCloseButton: false }
        );
    }, [openModal, activeFlag, recipe.id]);

    const handleConfirmDelete = useCallback(() => {
        deleteRecipe(recipe.id);
    }, [deleteRecipe, recipe.id]);

    const handleDelete = useCallback(() => {
        openModal(
            (close) => (
                <DeleteRecipeConfirmationModal
                    recipeTitle={recipe.title}
                    onDelete={handleConfirmDelete}
                    onCancel={close}
                    close={close}
                />
            ),
            { hideCloseButton: true }
        );
    }, [openModal, recipe.title, handleConfirmDelete]);

    return (
        <div className="flex flex-col items-center pt-10 pb-16 px-4 max-w-2xl mx-auto text-center">
            <div className="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-danger-50 dark:bg-danger-900/30 text-danger">
                <Icon name="flag" size={32} />
            </div>

            <Typography as="h1" variant="heading-lg" className="mb-3">
                {t('recipe.flag.author.heading')}
            </Typography>

            <Typography
                variant="body"
                className="mb-6 text-gray-700 dark:text-gray-300"
            >
                {t('recipe.flag.author.body')}
            </Typography>

            <div className="w-full mb-6 p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-left">
                <Typography
                    variant="body-sm"
                    className="uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1"
                >
                    {t('recipe.flag.author.bucket-label')}
                </Typography>

                <Typography variant="body" className="font-semibold mb-2">
                    {t(`recipe.flag.bucket.${bucket}.label`)}
                </Typography>

                <Typography
                    variant="body-sm"
                    className="text-gray-700 dark:text-gray-300 mb-3"
                >
                    {t(`recipe.flag.bucket.${bucket}.description`)}
                </Typography>

                {reason ? (
                    <details className="mt-3">
                        <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200">
                            {t('recipe.flag.author.details-toggle')}
                        </summary>

                        <Typography
                            variant="body-sm"
                            className="mt-2 text-gray-700 dark:text-gray-300"
                        >
                            {t(`recipe.flag.reason.${reason}`)}
                        </Typography>
                    </details>
                ) : null}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center">
                <ButtonBase
                    color="primary"
                    onClick={handleEdit}
                    className="min-w-40"
                >
                    {t('recipe.flag.action.edit')}
                </ButtonBase>

                <ButtonBase
                    color="secondary"
                    onClick={handleAppeal}
                    className="min-w-40"
                    disabled={!activeFlag}
                >
                    {t('recipe.flag.action.appeal')}
                </ButtonBase>

                <ButtonBase
                    color="danger"
                    outlined
                    onClick={handleDelete}
                    className="min-w-40"
                    disabled={isDeleting}
                >
                    {t('recipe.flag.action.delete')}
                </ButtonBase>
            </div>
        </div>
    );
};
