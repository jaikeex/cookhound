'use client';

import React, { useCallback } from 'react';
import { ButtonWithCooldown } from '@/client/components/molecules/Button/WithCooldown';
import { Typography } from '@/client/components/atoms/Typography';
import { chqc } from '@/client/data';
import { t } from '@/client/locales';
import { getErrorMessage } from '@/client/error';

export type VerifyEmailTemplateProps = Readonly<{
    new: boolean;
}>;

export const VerifyEmailTemplate: React.FC<VerifyEmailTemplateProps> = ({
    new: newParam
}) => {
    const { mutate: resendVerificationEmail, error } =
        chqc.user.useResendVerificationEmail({ meta: { errorMessage: false } });

    const handleResendVerificationEmail = useCallback(async () => {
        const email = new URLSearchParams(window.location.search).get('email');
        if (!email) return;

        resendVerificationEmail(email);
    }, [resendVerificationEmail]);

    return (
        <div
            className="w-full max-w-md mx-auto text-center space-y-8 flex items-center flex-col"
            data-testid="verify-email-message"
        >
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
                data-testid="verify-email-resend"
            >
                {t('app.general.resend-email')}
            </ButtonWithCooldown>

            {error && <p>{getErrorMessage(error)}</p>}
        </div>
    );
};
