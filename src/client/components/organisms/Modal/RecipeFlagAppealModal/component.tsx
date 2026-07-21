'use client';

import React, { useCallback, useState } from 'react';
import {
    ButtonBase,
    ErrorList,
    Submit,
    Textarea,
    Typography
} from '@/client/components';
import { useSnackbar } from '@/client/store';
import { chqc } from '@/client/data';
import type { ModalProps } from '@/client/components/organisms/Modal/types';
import { t } from '@/client/locales';

const APPEAL_ERROR_CODE = {
    APPEAL_ALREADY_PENDING: 'APPEAL_ALREADY_PENDING',
    FLAG_NOT_ACTIVE: 'FLAG_NOT_ACTIVE'
} as const;

const MIN_LEN = 10;
const MAX_LEN = 2000;

export type RecipeFlagAppealModalProps = Readonly<{
    recipeId: number;
    flagId: number;
}> &
    ModalProps;

export const RecipeFlagAppealModal: React.FC<RecipeFlagAppealModalProps> = ({
    recipeId,
    flagId,
    close
}) => {
    const { alert } = useSnackbar();

    const [message, setMessage] = useState('');
    const [validationError, setValidationError] = useState<string | null>(null);
    const [serverError, setServerError] = useState<string | null>(null);

    const handleMessageChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setMessage(event.target.value);
        },
        []
    );

    const { mutate: submitAppeal, isPending } = chqc.recipe.useSubmitAppeal({
        onSuccess: () => {
            alert({
                message: t('recipe.flag.appeal.success'),
                variant: 'success'
            });

            close();
        },
        onError: (error) => {
            if (error.code === APPEAL_ERROR_CODE.APPEAL_ALREADY_PENDING) {
                setServerError(t('recipe.flag.appeal.error.already-pending'));
            } else if (error.code === APPEAL_ERROR_CODE.FLAG_NOT_ACTIVE) {
                setServerError(t('recipe.flag.appeal.error.flag-not-active'));
            } else {
                setServerError(t('recipe.flag.appeal.error.default'));
            }
        }
    });

    const handleSubmit = useCallback(
        (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setValidationError(null);
            setServerError(null);

            const trimmed = message.trim();

            if (trimmed.length < MIN_LEN) {
                setValidationError(
                    t('recipe.flag.appeal.error.too-short', {
                        min: MIN_LEN.toString()
                    })
                );
                return;
            }

            if (trimmed.length > MAX_LEN) {
                setValidationError(
                    t('recipe.flag.appeal.error.too-long', {
                        max: MAX_LEN.toString()
                    })
                );
                return;
            }

            submitAppeal({ recipeId, flagId, message: trimmed });
        },
        [message, submitAppeal, recipeId, flagId]
    );

    const errorsToDisplay = [validationError, serverError].filter(
        (entry): entry is string => Boolean(entry)
    );

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col w-full max-w-[80dvw] md:max-w-xl px-2 md:px-4"
        >
            <Typography as="h2" variant="heading-sm" className="mb-2">
                {t('recipe.flag.appeal.modal.title')}
            </Typography>

            <Typography
                variant="body-sm"
                className="mb-4 text-gray-700 dark:text-gray-300"
            >
                {t('recipe.flag.appeal.modal.body')}
            </Typography>

            <Textarea
                id="recipe-flag-appeal-message"
                name="message"
                label={t('recipe.flag.appeal.label')}
                placeholder={t('recipe.flag.appeal.placeholder')}
                rows={6}
                disabled={isPending}
                onChange={handleMessageChange}
            />

            <Typography
                variant="body-sm"
                className="mt-1 text-right text-gray-500 dark:text-gray-400"
            >
                {message.length} / {MAX_LEN}
            </Typography>

            <ErrorList className="self-start mt-3" errors={errorsToDisplay} />

            <div className="flex flex-col-reverse sm:flex-row gap-3 mt-6">
                <ButtonBase
                    color="subtle"
                    outlined
                    onClick={close}
                    className="w-full"
                    disabled={isPending}
                >
                    {t('app.general.cancel')}
                </ButtonBase>

                <Submit
                    label={t('recipe.flag.appeal.submit')}
                    pending={isPending}
                    className="w-full"
                />
            </div>
        </form>
    );
};
