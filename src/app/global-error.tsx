'use client';

import '@/client/globals.css';

import React from 'react';
import { ErrorBoundaryTemplate } from '@/client/components/templates/Error/Boundary';
import { DEFAULT_LOCALE } from '@/common/constants';

const FALLBACK_THEME = 'dark';

type ErrorPageProps = Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>;

export default function GlobalError({ error, reset }: ErrorPageProps) {
    return (
        <html
            lang={DEFAULT_LOCALE}
            className={FALLBACK_THEME}
            style={{ colorScheme: FALLBACK_THEME }}
        >
            <body className="min-h-screen bg-green-50 dark:bg-gray-950 typography-base">
                <ErrorBoundaryTemplate
                    error={error}
                    reset={reset}
                    titleKey="app.error.global"
                    descriptionKey="app.error.global.description"
                    logLabel="Global error"
                    withLogo
                />
            </body>
        </html>
    );
}
