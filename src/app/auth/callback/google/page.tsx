'use client';

import React, { useEffect } from 'react';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import { Loader, Typography } from '@/client/components';
import { useLocale } from '@/client/store';

export const dynamic = 'force-dynamic';

export default function GoogleCallbackPage() {
    const { t } = useLocale();

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const data = {
            authCode: new URLSearchParams(window.location.search).get('code')
        };

        if (!data || !data.authCode) {
            return;
        }

        window.opener.postMessage(data, ENV_CONFIG_PUBLIC.ORIGIN);
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
