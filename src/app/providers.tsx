import React from 'react';
import { ThemeProvider } from 'next-themes';
import {
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
    <ThemeProvider
        attribute="class"
        defaultTheme={initialTheme}
        enableSystem={false}
        disableTransitionOnChange
    >
        <AuthProvider>
            <ConsentProvider initialConsent={initialConsent}>
                <LocaleProvider
                    defaultMessages={messages}
                    defaultLocale={locale}
                >
                    <SnackbarProvider>
                        <ModalProvider>{children}</ModalProvider>
                    </SnackbarProvider>
                </LocaleProvider>
            </ConsentProvider>
        </AuthProvider>
    </ThemeProvider>
);

export default AppProviders;
