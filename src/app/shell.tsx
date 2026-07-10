'use client';

import { useEffect } from 'react';
import { useLocalePersistence, useThemePersistence } from '@/client/hooks';
import { useAuth, useLocale } from '@/client/store';

type ClientShellProps = NonNullable<unknown>;

export const ClientShell: React.FC<ClientShellProps> = () => {
    const { user } = useAuth();
    const { locale } = useLocale();

    useThemePersistence(user?.id);
    useLocalePersistence(user?.id);

    // Keep <html lang> in sync with the visitor's locale.
    useEffect(() => {
        document.documentElement.lang = locale;
    }, [locale]);

    return null;
};
