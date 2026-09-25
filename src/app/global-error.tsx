'use client';

import '@/client/globals.css';

import React, { useEffect, useState } from 'react';
import { ErrorBoundaryTemplate } from '@/client/components/templates/Error/Boundary';
import { THEME_STORAGE_KEY } from '@/client/constants';
import { t } from '@/client/locales';
import { DEFAULT_LOCALE } from '@/common/constants';
import type { Theme } from '@/client/types';

const FALLBACK_THEME = 'dark';

type ErrorPageProps = Readonly<{
    error: Error & { digest?: string };
    retry: () => void;
}>;

export default function GlobalError({ error, retry }: ErrorPageProps) {
    // This replaces the root layout, so ThemeProvider and its bootstrap script are gone.
    const [theme, setTheme] = useState<Theme>(FALLBACK_THEME);

    useEffect(() => {
        try {
            const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
            if (stored === 'light' || stored === 'dark') setTheme(stored);
        } catch {
            // Storage blocked; keep the fallback.
        }
    }, []);

    return (
        <html
            lang={DEFAULT_LOCALE}
            className={theme === 'dark' ? 'dark' : undefined}
            style={{ colorScheme: theme }}
        >
            <body className="min-h-screen bg-green-50 dark:bg-gray-950 typography-base">
                <title>{t('app.error.global')}</title>
                <ErrorBoundaryTemplate
                    error={error}
                    retry={retry}
                    titleKey="app.error.global"
                    descriptionKey="app.error.global.description"
                    source="global-error"
                    withLogo
                />
            </body>
        </html>
    );
}
