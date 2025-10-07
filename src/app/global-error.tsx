'use client';

import React, { useEffect, useState } from 'react';
import { ButtonBase, Logo, Typography } from '@/client/components';
import Link from 'next/link';
import { locales, type Locale } from '@/client/locales';
import { DEFAULT_LOCALE } from '@/common/constants';

type ErrorPageProps = Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>;

export default function GlobalError({ error }: ErrorPageProps) {
    /**
     * This requires custom translation solution because it cannot be a server component
     * and lives outside the app tree so i18n context is not available.
     */
    const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

    useEffect(() => {
        const browserLang = navigator.language.split('-')[0] as Locale;
        if (browserLang === 'cs' || browserLang === 'en') {
            setLocale(browserLang);
        }

        console.error('Global error:', error);
    }, [error]);

    const messages = locales[locale];

    return (
        <html lang={locale}>
            <body>
                <div className="flex flex-col items-center min-h-screen pt-10 text-center">
                    <Logo className="logo-md mb-8" />

                    <Typography variant="heading-lg" className="mb-4">
                        {messages['app.error.global']}
                    </Typography>

                    <Typography
                        variant="body"
                        className="mb-6 text-gray-700 dark:text-gray-300"
                    >
                        {messages['app.error.global.description']}
                    </Typography>

                    <Link href={'/'} className="mx-auto">
                        <ButtonBase className="mx-auto w-52" color="primary">
                            {messages['app.general.home']}
                        </ButtonBase>
                    </Link>
                </div>
            </body>
        </html>
    );
}
