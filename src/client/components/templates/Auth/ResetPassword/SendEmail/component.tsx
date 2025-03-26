'use client';

import React, { useCallback, useState } from 'react';
import type {
    LoginFormErrors,
    SimpleEmailFormErrors
} from '@/client/components';
import { SimpleEmailForm, Typography } from '@/client/components';
import type { ResetPasswordEmailPayload } from '@/client/services';
import { authService } from '@/client/services';
import { object, string } from 'yu@/client/utils
import { useLocale } from '@/client/store';
import type { SubmitHandler } from '@/client/components/organisms/Form/types';
import { validateFormData } from '@/utils';

const sendResetPasswordEmailSchema = object().shape({
    email: string()
        .email('auth.error.email-invalid')
        .required('auth.error.email-required')
});

export const SendResetPasswordEmailTemplate: React.FC = () => {
    const formRef = React.useRef<HTMLFormElement>(null);

    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
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
    const handleSubmit: SubmitHandler = useCallback(
        async (data: FormData) => {
            let formData: ResetPasswordEmailPayload;

            try {
                formData = extractFormData(data);

                const validationErrors: SimpleEmailFormErrors =
                    await validateFormData(
                        formData,
                        sendResetPasswordEmailSchema
                    );

                if (Object.keys(validationErrors).length > 0) {
                    setFormErrors(validationErrors);
                    return;
                }
            } catch (error) {
                setFormErrors({ server: 'auth.error.default' });
                return;
            }

            try {
                setFormErrors({});
                await authService.sendResetPasswordEmail(formData);
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
        <div className="w-full max-w-md mx-auto space-y-4 flex items-center flex-col">
            <Typography align="center">
                {t('auth.form.reset-password.email-prompt')}
            </Typography>

            <form className="w-full" action={handleSubmit} ref={formRef}>
                <SimpleEmailForm errors={formErrors} disabled={disabled} />
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
