'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type {
    LoginFormErrors,
    ResetPasswordFormErrors
} from '@/client/components';
import { ResetPasswordForm, Typography } from '@/client/components';
import type { ResetPasswordPayload } from '@/common/types';
import { z } from 'zod';
import { useLocale } from '@/client/store';

import { validateFormData } from '@/client/utils';
import Link from 'next/link';
import type { I18nMessage } from '@/client/locales';
import { chqc } from '@/client/request/queryClient';

//~---------------------------------------------------------------------------------------------~//
//$                                          VALIDATION                                         $//
//~---------------------------------------------------------------------------------------------~//

const resetPasswordSchema = z
    .object({
        password: z
            .string()
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
                'auth.error.password-missing-character'
            )
            .min(6, 'auth.error.password-min-length')
            .max(40, 'auth.error.password-max-length')
            .min(1, 'auth.error.password-required'),
        repeatPassword: z
            .string()
            .trim()
            .min(1, 'auth.error.repeat-password-required')
    })
    .refine((data) => data.password === data.repeatPassword, {
        message: 'auth.error.passwords-dont-match',
        path: ['repeatPassword']
    });

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

type ResetPasswordFormData = {
    password: string;
    repeatPassword: string;
};

export const ResetPasswordTemplate: React.FC = () => {
    const { t } = useLocale();

    const formRef = React.useRef<HTMLFormElement>(null);

    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
    const [disabled, setDisabled] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);

    const {
        mutate: resetPassword,
        error,
        isPending
    } = chqc.user.useResetPassword({
        onSuccess: () => {
            formRef.current?.reset();
            disableForm();
            setSubmitted(true);
        }
    });

    const disableForm = useCallback(() => {
        setDisabled(true);
    }, []);

    /**
     * Handles the form submission.
     * Validates the form data and sends a request to reset the user's password.
     * If the request is successful, the form is locked and the user is notified.
     */
    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const formElement = event.currentTarget;
            const data = new FormData(formElement);
            let formData: ResetPasswordFormData;

            try {
                formData = extractFormData(data);
                const validationErrors: ResetPasswordFormErrors =
                    await validateFormData(formData, resetPasswordSchema);

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    return;
                }
            } catch (error: unknown) {
                setFormErrors({ server: 'auth.error.default' });
                return;
            }

            const token = new URLSearchParams(window.location.search).get(
                'token'
            );

            if (!token) {
                setFormErrors({ server: 'auth.error.missing-token' });
                return;
            }

            setFormErrors({});

            const payload: ResetPasswordPayload = {
                password: formData.password,
                token
            };

            resetPassword(payload);
        },
        [resetPassword]
    );

    useEffect(() => {
        if (error) {
            setFormErrors({ server: error.message as I18nMessage });
        }
    }, [error]);

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4">
            <Typography align="center">
                {t('auth.form.reset-password.prompt')}
            </Typography>

            <form className="w-full" onSubmit={handleSubmit} ref={formRef}>
                <ResetPasswordForm
                    errors={formErrors}
                    disabled={disabled}
                    pending={isPending}
                />
            </form>

            {submitted ? (
                <div className="space-y-4 !mt-8">
                    <Typography align="center" className="space-x-3">
                        {t('auth.form.reset-password.success')}
                    </Typography>
                    <Typography align="center" className="space-x-3">
                        <Link href={`/auth/login`}>
                            {t('auth.form.reset-password.continue')}
                        </Link>
                    </Typography>
                </div>
            ) : null}
        </div>
    );
};

function extractFormData(data: FormData): ResetPasswordFormData {
    return {
        password: data.get('password') as string,
        repeatPassword: data.get('repeat-password') as string
    };
}
