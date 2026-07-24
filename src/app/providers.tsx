import React from 'react';
import {
    ThemeProvider,
    AuthProvider,
    SnackbarProvider,
    ModalProvider,
    MotionProvider,
    ConsentProvider
} from '@/client/store';
import { DataProvider, repositories } from '@/client/data';
import type { CookieConsent } from '@/common/types/cookie-consent';

export type AppProvidersProps = Readonly<{
    initialTheme: 'light' | 'dark';
    initialConsent: CookieConsent | null;
    children: React.ReactNode;
}>;

export const AppProviders: React.FC<AppProvidersProps> = ({
    initialTheme,
    initialConsent,
    children
}) => (
    <MotionProvider>
        <ThemeProvider defaultTheme={initialTheme}>
            <DataProvider value={repositories}>
                <AuthProvider>
                    <SnackbarProvider>
                        <ConsentProvider initialConsent={initialConsent}>
                            <ModalProvider>{children}</ModalProvider>
                        </ConsentProvider>
                    </SnackbarProvider>
                </AuthProvider>
            </DataProvider>
        </ThemeProvider>
    </MotionProvider>
);

export default AppProviders;
