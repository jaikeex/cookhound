import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Kalam, Open_Sans } from 'next/font/google';
import '@/client/globals.css';
import {
    LocaleProvider,
    AuthProvider,
    SnackbarProvider,
    ModalProvider
} from '@/client/store';
import { ThemeProvider } from 'next-themes';
import { BottomNavigation, TopNavigation } from '@/client/components';
import { locales } from '@/client/locales';
import classnames from 'classnames';
import { cookies, headers } from 'next/headers';
import type { UserDTO } from '@/common/types';
import apiClient from '@/client/request';
import { getUserLocale } from '@/client/utils';

const openSans = Open_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-open-sans'
});
const kalam = Kalam({
    subsets: ['latin'],
    weight: ['300', '400', '700'],
    display: 'swap',
    variable: '--font-kalam'
});

export const metadata: Metadata = {
    title: 'Cookhound',
    description: 'Cookhound is a platform for sharing recipes'
};

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    //|-----------------------------------------------------------------------------------------|//
    //?                                          LOCALE                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    const cookieStore = await cookies();
    const headerList = await headers();

    const locale = await getUserLocale(cookieStore, headerList);

    // This is required to pass the messages down the tree as the default export from .json files is not serializable
    const messages = { ...locales[locale] };

    //|-----------------------------------------------------------------------------------------|//
    //?                                      AUTHENTICATION                                     ?//
    //|-----------------------------------------------------------------------------------------|//

    let user: UserDTO | null = null;

    try {
        if (typeof window !== 'undefined') {
            throw new Error('Cannot get user like this in a browser');
        }

        const token = cookieStore.get('jwt')?.value;

        if (!token) {
            throw new Error('No token found');
        }

        user = await apiClient.auth.getCurrentUser({
            headers: { 'Cookie': `jwt=${token}` }
        });
    } catch (error) {
        user = null;
    }

    //|-----------------------------------------------------------------------------------------|//
    //?                                          RENDER                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    return (
        <html lang="en" suppressHydrationWarning>
            <body className={`${kalam.variable} ${openSans.variable}`}>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="light"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    <LocaleProvider
                        defaultMessages={messages}
                        defaultLocale={locale}
                    >
                        <AuthProvider user={user} authResolved={!!user}>
                            <SnackbarProvider>
                                <ModalProvider>
                                    <div
                                        id="main-page"
                                        className="fixed top-0 flex flex-col h-[100dvh] overflow-y-auto page-background typography-base"
                                    >
                                        <Suspense fallback={null}>
                                            <TopNavigation />
                                        </Suspense>
                                        <div
                                            id="main-content"
                                            className={classnames(
                                                'flex-1 px-2 pt-4 pb-16 md:px-4 md:pt-12',
                                                'relative'
                                            )}
                                        >
                                            {children}
                                        </div>
                                        <BottomNavigation />
                                    </div>
                                </ModalProvider>
                            </SnackbarProvider>
                        </AuthProvider>
                    </LocaleProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
