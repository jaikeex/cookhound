'use client';

import React, { useCallback, useState } from 'react';
import apiClient from '@/client/request';
import { ButtonWithCooldown, Typography } from '@/client/components';
import { useLocale } from '@/client/store';

export const VerifyEmailTemplate: React.FC = () => {
    const [error, setError] = useState<string | null>(null);
    const { t } = useLocale();

    const resendVerificationEmail = useCallback(async () => {
        const email = new URLSearchParams(window.location.search).get('email');

        try {
            if (!email) return;
            await apiClient.user.resendVerificationEmail(email);
        } catch (error: any) {
            setError(error.message);
        }
    }, []);

    return (
        <div className="w-full max-w-md mx-auto text-center space-y-8 flex items-center flex-col">
            <Typography>{t('auth.register.success.title')}</Typography>

            <Typography>{t('auth.register.success.description')}</Typography>

            <ButtonWithCooldown
                cooldown={60000}
                onClick={resendVerificationEmail}
            >
                {t('app.general.resend-email')}
            </ButtonWithCooldown>

            {error && <p>{error}</p>}
        </div>
    );
};
