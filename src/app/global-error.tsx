'use client';

import React, { useEffect } from 'react';
import { ButtonBase, Logo, Typography } from '@/client/components';
import Link from 'next/link';
import { t } from '@/client/locales';
import { DEFAULT_LOCALE } from '@/common/constants';

type ErrorPageProps = Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>;

export default function GlobalError({ error }: ErrorPageProps) {
    useEffect(() => {
        console.error('Global error:', error);
    }, [error]);

    return (
        <html lang={DEFAULT_LOCALE}>
            <body>
                <div className="flex flex-col items-center min-h-screen pt-10 text-center">
                    <Logo className="logo-md mb-8" />

                    <Typography as="h1" variant="heading-lg" className="mb-4">
                        {t('app.error.global')}
                    </Typography>

                    <Typography
                        variant="body"
                        className="mb-6 text-gray-700 dark:text-gray-300"
                    >
                        {t('app.error.global.description')}
                    </Typography>

                    <Link href={'/'} className="mx-auto">
                        <ButtonBase className="mx-auto w-52" color="primary">
                            {t('app.general.home')}
                        </ButtonBase>
                    </Link>
                </div>
            </body>
        </html>
    );
}
