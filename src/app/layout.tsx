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
import {
    BottomNavigation,
    TopNavigation,
    ScrollToTop
} from '@/client/components';
import { locales } from '@/client/locales';
import { classNames } from '@/client/utils';
import { cookies, headers } from 'next/headers';
import type { UserDTO } from '@/common/types';
import apiClient from '@/client/request';
import { getUserLocale } from '@/client/utils';
import { CONTENT_WRAPPER_ID, MAIN_PAGE_ID } from '@/client/constants';

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
                    defaultTheme="dark"
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
                                    <ScrollToTop />
                                    <div
                                        id={MAIN_PAGE_ID}
                                        className="flex flex-col typography-base"
                                    >
                                        <div className="fixed top-0 left-0 w-screen h-screen page-background z-[-10]" />
                                        <Suspense fallback={null}>
                                            <TopNavigation />
                                        </Suspense>
                                        <div
                                            id={CONTENT_WRAPPER_ID}
                                            className={classNames(
                                                'flex-1 px-2 pt-16 pb-16 md:px-4 md:pt-24',
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
