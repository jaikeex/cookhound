'use client';

import React, { useCallback, useState } from 'react';
import type {
    LoginFormErrors,
    ResetPasswordFormErrors
} from '@/client/components';
import { ResetPasswordForm, Typography } from '@/client/components';
import type { ResetPasswordPayload } from '@/common/types';
import { authService } from '@/client/services';
import { object, ref, string } from 'yup';
import { useLocale } from '@/client/store';
import type { SubmitHandler } from '@/client/components/organisms/Form/types';
import { validateFormData } from '@/client/utils';
import Link from 'next/link';

type ResetPasswordFormData = {
    password: string;
    repeatPassword: string;
};

const resetPasswordSchema = object().shape({
    password: string()
        .matches(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/,
            'auth.error.password-missing-character'
        )
        .min(6, 'auth.error.password-min-length')
        .max(40, 'auth.error.password-max-length')
        .required('auth.error.password-required'),
    repeatPassword: string()
        .oneOf([ref('password')], 'auth.error.passwords-dont-match')
        .required('auth.error.repeat-password-required')
});

export const ResetPasswordTemplate: React.FC = () => {
    const formRef = React.useRef<HTMLFormElement>(null);

    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
    const [disabled, setDisabled] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);

    const { t } = useLocale();

    const disableForm = useCallback(() => {
        setDisabled(true);
    }, []);

    /**
     * Handles the form submission.
     * Validates the form data and sends a request to reset the user's password.
     * If the request is successful, the form is locked and the user is notified.
     */
    const handleSubmit: SubmitHandler = useCallback(
        async (data: FormData) => {
            let formData: ResetPasswordFormData;

            try {
                formData = extractFormData(data);
                const validationErrors: ResetPasswordFormErrors =
                    await validateFormData(formData, resetPasswordSchema);

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    return;
                }
            } catch (error) {
                setFormErrors({ server: 'auth.error.default' });
                return;
            }

            try {
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

                await authService.resetPassword(payload);
                formRef.current?.reset();
                disableForm();
                setSubmitted(true);
            } catch (error: any) {
                if (submitted) setSubmitted(false);
                setFormErrors({
                    server: error.message ?? 'auth.error.default'
                });
            }
        },
        [disableForm, submitted]
    );

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4">
            <Typography align="center">
                {t('auth.form.reset-password.prompt')}
            </Typography>

            <form className="w-full" action={handleSubmit} ref={formRef}>
                <ResetPasswordForm errors={formErrors} disabled={disabled} />
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
