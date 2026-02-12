import React from 'react';
import {
    ThemeProvider,
    LocaleProvider,
    AuthProvider,
    SnackbarProvider,
    ModalProvider,
    ConsentProvider
} from '@/client/store';
import type { CookieConsent } from '@/common/types/cookie-consent';
import type { Messages, Locale } from '@/client/locales';

export type AppProvidersProps = Readonly<{
    initialTheme: 'light' | 'dark';
    initialConsent: CookieConsent | null;
    messages: Messages;
    locale: Locale;
    children: React.ReactNode;
}>;

export const AppProviders: React.FC<AppProvidersProps> = ({
    initialTheme,
    initialConsent,
    messages,
    locale,
    children
}) => (
    <ThemeProvider defaultTheme={initialTheme}>
        <AuthProvider>
            <SnackbarProvider>
                <LocaleProvider
                    defaultMessages={messages}
                    defaultLocale={locale}
                >
                    <ConsentProvider initialConsent={initialConsent}>
                        <ModalProvider>{children}</ModalProvider>
                    </ConsentProvider>
                </LocaleProvider>
            </SnackbarProvider>
        </AuthProvider>
    </ThemeProvider>
);

export default AppProviders;
