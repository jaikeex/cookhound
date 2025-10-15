'use client';

import React, { useEffect } from 'react';
import { ENV_CONFIG_PUBLIC, OAUTH_STATE_KEY } from '@/common/constants';
import { Loader, Typography } from '@/client/components';
import { useLocale } from '@/client/store';

export const dynamic = 'force-dynamic';

export default function GoogleCallbackPage() {
    const { t } = useLocale();

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const authCode = params.get('code');
        const state = params.get('state');

        if (!authCode || !state) {
            return;
        }

        const storedState = sessionStorage.getItem(OAUTH_STATE_KEY);

        if (!storedState || storedState !== state) {
            window.opener?.postMessage(
                { error: 'invalid_state' },
                ENV_CONFIG_PUBLIC.ORIGIN
            );

            window.close();
            return;
        }

        window.opener.postMessage(
            { authCode, state },
            ENV_CONFIG_PUBLIC.ORIGIN
        );

        window.close();
    }, []);

    return (
        <div className="w-full max-w-md mx-auto py-8 text-center">
            <div className="flex flex-col items-center space-y-4">
                <Loader size="lg" />
                <Typography>
                    {t('auth.form.authenticating-with-google')}
                </Typography>
            </div>
        </div>
    );
}
