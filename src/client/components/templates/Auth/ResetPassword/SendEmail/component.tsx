'use client';

import React, { useCallback, useEffect, useState } from 'react';
import type { LoginFormErrors } from '@/client/components/organisms/Form/Login';
import type { SimpleEmailFormErrors } from '@/client/components/organisms/Form/SimpleEmailForm';
import { CaptchaDisclosure } from '@/client/components/molecules/CaptchaDisclosure';
import { SimpleEmailForm } from '@/client/components/organisms/Form/SimpleEmailForm';
import { Typography } from '@/client/components/atoms/Typography';
import type { ResetPasswordEmailFormData } from '@/common/types';
import { z } from 'zod';
import { useCaptcha } from '@/client/hooks';
import { validateFormData, executeCaptcha } from '@/client/utils';
import { chqc } from '@/client/data';
import { t } from '@/client/locales';
import { getErrorMessageKey } from '@/client/error';

export type SendResetPasswordEmailTemplateProps = Readonly<{
    email: string;
}>;

//~---------------------------------------------------------------------------------------------~//
//$                                          VALIDATION                                         $//
//~---------------------------------------------------------------------------------------------~//

const sendResetPasswordEmailSchema = z.object({
    email: z
        .email('auth.error.email-invalid')
        .min(1, 'auth.error.email-required')
});

//~---------------------------------------------------------------------------------------------~//
//$                                          COMPONENT                                          $//
//~---------------------------------------------------------------------------------------------~//

export const SendResetPasswordEmailTemplate: React.FC<
    SendResetPasswordEmailTemplateProps
> = ({ email }) => {
    const { ready: captchaReady } = useCaptcha();

    const formRef = React.useRef<HTMLFormElement>(null);

    const [formErrors, setFormErrors] = useState<LoginFormErrors>({});
    const [disabled, setDisabled] = React.useState(false);
    const [submitted, setSubmitted] = React.useState(false);

    const {
        mutate: sendResetPasswordEmail,
        error,
        isPending
    } = chqc.user.useSendResetPasswordEmail({
        onSuccess: () => {
            formRef.current?.reset();
            disableForm();
            setSubmitted(true);
        }
    });

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
            let formData: ResetPasswordEmailFormData;

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
            } catch (error: unknown) {
                setFormErrors({ server: 'auth.error.default' });
                return;
            }

            let captchaToken: string;

            try {
                captchaToken = await executeCaptcha('reset_password');
            } catch (error: unknown) {
                setFormErrors({ server: 'app.error.captcha-failed' });
                return;
            }

            setFormErrors({});

            sendResetPasswordEmail({ ...formData, captchaToken });
        },
        [sendResetPasswordEmail]
    );

    useEffect(() => {
        if (error) {
            setFormErrors({ server: getErrorMessageKey(error) });
        }
    }, [error]);

    return (
        <div className="flex flex-col items-center w-full max-w-md mx-auto space-y-4">
            <Typography align="center">
                {t('auth.form.reset-password.email-prompt')}
            </Typography>

            <form className="w-full" onSubmit={handleSubmit} ref={formRef}>
                <SimpleEmailForm
                    errors={formErrors}
                    disabled={disabled || !captchaReady}
                    pending={isPending}
                    defaultEmail={email}
                />
            </form>

            <CaptchaDisclosure className="max-w-96" />

            {submitted ? (
                <div className="space-y-4 mt-8!">
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

function extractFormData(data: FormData): ResetPasswordEmailFormData {
    return {
        email: data.get('email') as string
    };
}
