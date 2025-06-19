import React, { Suspense } from 'react';
import type { Metadata } from 'next';
import { Kalam, Open_Sans } from 'next/font/google';
import '@/client/globals.css';
import { LocaleProvider, AuthProvider, SnackbarProvider } from '@/client/store';
import { ThemeProvider } from 'next-themes';
import { BottomNavigation, TopNavigation } from '@/client/components';
import { locales } from '@/client/locales';
import classnames from 'classnames';
// import { cookies, headers } from 'next/headers';
// import { getUserLocale } from '@/utils';

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
    // const cookieStore = cookies();
    // const headerList = headers();
    //
    // const locale = await getUserLocale(cookieStore, headerList);
    const locale = 'cs';

    // This is required to pass the messages down the tree as the default export from .json files is not serializable
    const messages = { ...locales[locale] };

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
                        <AuthProvider>
                            <SnackbarProvider>
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
                            </SnackbarProvider>
                        </AuthProvider>
                    </LocaleProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
