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
                <ThemeProvider attribute="class">
                    <LocaleProvider
                        defaultMessages={messages}
                        defaultLocale={locale}
                    >
                        <AuthProvider>
                            <SnackbarProvider>
                                <div className="fixed top-0 h-screen overflow-y-auto page-background typography-base">
                                    <Suspense fallback={<TopNavigation />}>
                                        <TopNavigation />
                                    </Suspense>
                                    <div
                                        className={classnames(
                                            'pt-4 px-4 pb-24 md:pb-12 md:pt-12',
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
