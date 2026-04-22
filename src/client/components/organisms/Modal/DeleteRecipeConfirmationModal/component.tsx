import React, { useCallback } from 'react';
import type { ModalProps } from '@/client/components/organisms/Modal/types';
import { ButtonBase, Typography } from '@/client/components';
import { useLocale } from '@/client/store';

type DeleteRecipeConfirmationModalProps = Readonly<{
    recipeTitle: string;
    onCancel?: () => void;
    onDelete?: () => void;
}> &
    ModalProps;

export const DeleteRecipeConfirmationModal: React.FC<
    DeleteRecipeConfirmationModalProps
> = ({ recipeTitle, onCancel, onDelete, close }) => {
    const { t } = useLocale();

    const handleClose = useCallback(() => {
        onCancel?.();
        close?.();
    }, [onCancel, close]);

    const handleApply = useCallback(() => {
        onDelete?.();
        close?.();
    }, [onDelete, close]);

    return (
        <div className="flex flex-col w-full h-full max-h-[85dvh] md:max-h-[70dvh] max-w-[80dvw] md:max-w-[80dvw] xl:max-w-[70dvw] px-4">
            <Typography as="h2" variant="heading-sm">
                {t('app.recipe.delete-confirmation', { recipeTitle })}
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
                    color="danger"
                    onClick={handleApply}
                    size="md"
                    className="w-full"
                >
                    {t('app.general.confirm')}
                </ButtonBase>
            </div>
        </div>
    );
};
