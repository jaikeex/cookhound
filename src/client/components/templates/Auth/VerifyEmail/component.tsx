'use client';

import React, { useCallback } from 'react';
import { ButtonWithCooldown, Typography } from '@/client/components';
import { useLocale } from '@/client/store';
import { chqc } from '@/client/request/queryClient';
import type { I18nMessage } from '@/client/locales';

export type VerifyEmailTemplateProps = Readonly<{
    new: boolean;
}>;

export const VerifyEmailTemplate: React.FC<VerifyEmailTemplateProps> = ({
    new: newParam
}) => {
    const { t } = useLocale();

    const { mutate: resendVerificationEmail, error } =
        chqc.user.useResendVerificationEmail();

    const handleResendVerificationEmail = useCallback(async () => {
        const email = new URLSearchParams(window.location.search).get('email');
        if (!email) return;

        resendVerificationEmail(email);
    }, [resendVerificationEmail]);

    //TODO: Display a success message after the email is sent.

    console.log('newParam', newParam);
    console.log(
        't',
        newParam
            ? t('auth.register.success.title')
            : t('auth.verify-email.retry-title')
    );

    return (
        <div className="w-full max-w-md mx-auto text-center space-y-8 flex items-center flex-col">
            <Typography>
                {newParam
                    ? t('auth.register.success.title')
                    : t('auth.verify-email.retry-title')}
            </Typography>

            <Typography>
                {newParam
                    ? t('auth.register.success.description')
                    : t('auth.verify-email.retry-description')}
            </Typography>

            <ButtonWithCooldown
                cooldown={60000}
                onClick={handleResendVerificationEmail}
            >
                {t('app.general.resend-email')}
            </ButtonWithCooldown>

            {error && <p>{t(error.message as I18nMessage)}</p>}
        </div>
    );
};
