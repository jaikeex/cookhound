'use client';

import React, { useCallback, useState } from 'react';
import type {
    LoginFormErrors,
    SimpleEmailFormErrors
} from '@/client/components';
import { SimpleEmailForm, Typography } from '@/client/components';
import type { ResetPasswordEmailPayload } from '@/common/types';
import apiClient from '@/client/request';
import { z } from 'zod';
import { useLocale } from '@/client/store';

import { validateFormData } from '@/client/utils';
import type { I18nMessage } from '@/client/locales';

const sendResetPasswordEmailSchema = z.object({
    email: z
        .string()
        .email('auth.error.email-invalid')
        .min(1, 'auth.error.email-required')
});

export const SendResetPasswordEmailTemplate: React.FC = () => {
    const formRef = React.useRef<HTMLFormElement>(null);

    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [disabled, setDisabled] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);

    const { t } = useLocale();

    /**
     * Disables the form for a short period of time to prevent spamming.
     */
    const disableForm = useCallback(() => {
        setDisabled(true);

        setTimeout(() => {
            setDisabled(false);
        }, 10000);
    }, []);

    /**
     * Handles the form submission.
     * Validates the form data and sends a reset password email.
     * If the request is successful, the form is locked and the user is notified.
     */
    const handleSubmit = useCallback(
        async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault();

            const formElement = event.currentTarget;
            const data = new FormData(formElement);
            let formData: ResetPasswordEmailPayload;

            setIsSubmitting(true);

            try {
                formData = extractFormData(data);

                const validationErrors: SimpleEmailFormErrors =
                    await validateFormData(
                        formData,
                        sendResetPasswordEmailSchema
                    );

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    setIsSubmitting(false);
                    return;
                }
            } catch (error: unknown) {
                setFormErrors({ server: 'auth.error.default' });
                setIsSubmitting(false);
                return;
            }

            try {
                setFormErrors({});
                await apiClient.user.sendResetPasswordEmail(formData);
                formRef.current?.reset();
                disableForm();
                setSubmitted(true);
            } catch (error: unknown) {
                if (submitted) setSubmitted(false);
                setFormErrors({
                    server:
                        error instanceof Error
                            ? (error.message as I18nMessage)
                            : 'auth.error.default'
                });
            } finally {
                setIsSubmitting(false);
            }
        },
        [disableForm, submitted]
    );

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4">
            <Typography align="center">
                {t('auth.form.reset-password.email-prompt')}
            </Typography>

            <form className="w-full" onSubmit={handleSubmit} ref={formRef}>
                <SimpleEmailForm
                    errors={formErrors}
                    disabled={disabled}
                    pending={isSubmitting}
                />
            </form>

            {submitted ? (
                <div className="space-y-4 !mt-8">
                    <Typography align="center" className="space-x-3">
                        {t('auth.form.reset-password.email-sent')}
                    </Typography>
                    <Typography align="center" className="space-x-3">
                        {t('app.general.check-inbox')}
                    </Typography>
                </div>
            ) : null}
        </div>
    );
};

function extractFormData(data: FormData): ResetPasswordEmailPayload {
    return {
        email: data.get('email') as string
    };
}
