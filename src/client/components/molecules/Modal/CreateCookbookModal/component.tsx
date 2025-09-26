'use client';

import React, { useCallback, useState } from 'react';
import type { ModalProps } from '@/client/components/molecules/Modal/types';
import {
    CookbookForm,
    type CookbookFormErrors
} from '@/client/components/organisms/Form/Cookbook/component';
import { useLocale, useSnackbar } from '@/client/store';
import type { I18nMessage } from '@/client/locales';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import {
    type CookbookForCreatePayload,
    CookbookVisibility
} from '@/common/types';
import { useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { validateFormData } from '@/client/utils/form';
import { ButtonBase, Submit } from '@/client/components';

//~---------------------------------------------------------------------------------------------~//
//$                                          VALIDATION                                         $//
//~---------------------------------------------------------------------------------------------~//

export const createCookbookSchema = z.object({
    title: z
        .string()
        .min(1, 'app.cookbook.validation.title-required')
        .max(140, 'app.cookbook.validation.title-max-length'),
    description: z
        .string()
        .max(1400, 'app.cookbook.validation.description-max-length')
        .optional(),
    visibility: z.enum(CookbookVisibility)
});

//~---------------------------------------------------------------------------------------------~//
//$                                            TYPES                                            $//
//~---------------------------------------------------------------------------------------------~//

export type CreateCookbookModalProps = Readonly<{
    onCreate?: () => void;
}> &
    ModalProps;

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export const CreateCookbookModal: React.FC<CreateCookbookModalProps> = ({
    close,
    onCreate
}) => {
    const { t } = useLocale();
    const { alert } = useSnackbar();
    const queryClient = useQueryClient();

    const [errors, setErrors] = useState<CookbookFormErrors>({});

    const { mutateAsync: createCookbook, isPending } =
        chqc.cookbook.useCreateCookbook({
            onSuccess: () => {
                queryClient.invalidateQueries({
                    predicate: (query) =>
                        query.queryKey[0] !== QUERY_KEYS.cookbook.namespace
                });

                alert({
                    message: t('app.cookbook.create-success'),
                    variant: 'success'
                });

                onCreate?.();
                close();
            },
            onError: () => {
                setErrors({
                    server: 'app.error.default'
                });
            }
        });

    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const formElement = event.currentTarget;
            const data = new FormData(formElement);

            let formData: CookbookForCreatePayload;

            try {
                formData = extractFormData(data);
                const validationErrors: CookbookFormErrors =
                    await validateFormData(formData, createCookbookSchema);

                if (Object.keys(validationErrors).length > 0) {
                    setErrors(validationErrors);
                    return;
                }
            } catch (error: unknown) {
                setErrors({
                    server: 'app.general.unknown-error' as I18nMessage
                });
                return;
            }

            setErrors({});

            const payload: CookbookForCreatePayload = {
                title: formData.title,
                description: formData.description || null,
                visibility: formData.visibility as CookbookVisibility
            };

            await createCookbook(payload);
        },
        [createCookbook]
    );

    return (
        <form
            onSubmit={handleSubmit}
            className="flex flex-col h-full max-h-[85dvh] md:max-h-[70dvh] min-w-[80dvw]  md:min-w-[50dvw] xl:min-w-[30dvw] max-w-[90dvw] md:max-w-[50dvw] xl:max-w-[40dvw] px-4"
        >
            <CookbookForm
                errors={errors}
                pending={isPending}
                hideSubmit
                className="w-full max-w-xl"
            />

            <div className="flex gap-2 w-full justify-center items-center mt-4 max-w-xl mx-auto">
                <ButtonBase
                    className="w-full"
                    onClick={close}
                    color="subtle"
                    outlined
                    size="md"
                >
                    {t('app.general.cancel')}
                </ButtonBase>

                <Submit
                    className="w-full"
                    pending={isPending}
                    label={t('app.cookbook.create')}
                />
            </div>
        </form>
    );
};

function extractFormData(data: FormData): CookbookForCreatePayload {
    return {
        title: data.get('title') as string,
        description: data.get('description') as string,
        visibility: data.get('visibility') as CookbookVisibility
    };
}
