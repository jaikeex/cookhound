import React from 'react';
import '@/client/globals.css';
import type { Metadata, Viewport } from 'next';
import { Kalam, Open_Sans } from 'next/font/google';

import { QueryProvider } from '@/client/store';
import { AppProviders } from './providers';
import { ClientShell } from './shell';
import {
    BottomNavigation,
    TopNavigation,
    ScrollToTop,
    Head,
    Footer,
    ConsentBanner,
    GoogleAnalytics
} from '@/client/components';

import { CONTENT_WRAPPER_ID, MAIN_PAGE_ID } from '@/client/constants';
import { classNames } from '@/client/utils';
import { t } from '@/client/locales';
import { DEFAULT_LOCALE, ENV_CONFIG_PUBLIC } from '@/common/constants';

const openSans = Open_Sans({
    subsets: ['latin'],
    display: 'swap',
    variable: '--font-open-sans',
    preload: true,
    adjustFontFallback: true
});

const kalam = Kalam({
    subsets: ['latin'],
    weight: ['300', '400', '700'],
    display: 'swap',
    variable: '--font-kalam',
    preload: true,
    adjustFontFallback: true
});

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover'
};

//?—————————————————————————————————————————————————————————————————————————————————————————————?//
//?                                     STATIC ROOT LAYOUT                                      ?//
///
//# The root layout intentionally reads NO dynamic request APIs (cookies()/headers()).
//# Doing so would put the entire route subtree into dynamic rendering and break ISR
//# everywhere. (Yes, I made this mistake and did not realize for quite some time...)
//#
//# The values passed below are therefore static defaults, not request-derived state.
///
//?—————————————————————————————————————————————————————————————————————————————————————————————?//

export default function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang={DEFAULT_LOCALE} suppressHydrationWarning>
            <Head />
            <body className={`${kalam.variable} ${openSans.variable}`}>
                <QueryProvider>
                    <AppProviders initialTheme="dark" initialConsent={null}>
                        <ClientShell />
                        <ConsentBanner />
                        <GoogleAnalytics />
                        <ScrollToTop />
                        <div
                            id={MAIN_PAGE_ID}
                            className="flex flex-col typography-base min-h-screen"
                        >
                            <div className="fixed top-0 left-0 w-screen h-screen page-background -z-10" />
                            {/* DO NOT CHANGE THE ORDER OF THESE COMPONENTS (stacking order and z-index issues) */}
                            <TopNavigation />
                            <BottomNavigation />
                            <main
                                id={CONTENT_WRAPPER_ID}
                                className={classNames(
                                    'flex-1 px-2 pt-16 md:px-4 md:pt-24',
                                    'relative'
                                )}
                            >
                                {children}
                            </main>
                            <Footer />
                        </div>
                    </AppProviders>
                </QueryProvider>
            </body>
        </html>
    );
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const title = t('meta.site.title');
    const description = t('meta.site.description');

    return {
        metadataBase: new URL(ENV_CONFIG_PUBLIC.ORIGIN),
        title,
        description,
        openGraph: {
            siteName: 'Cookhound'
        },
        other: {
            'theme-color': '#1f2937'
        }
    };
}
