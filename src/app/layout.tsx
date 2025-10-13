import React from 'react';
import '@/client/globals.css';
import type { Metadata, Viewport } from 'next';
import { cookies, headers } from 'next/headers';
import { Kalam, Open_Sans } from 'next/font/google';
import { QueryClient, dehydrate } from '@tanstack/react-query';

import { QueryProvider } from '@/client/store';
import { AppProviders } from './providers';
import { ClientShell } from './shell';
import {
    BottomNavigation,
    TopNavigation,
    ScrollToTop,
    Head,
    Footer,
    ConsentBanner
} from '@/client/components';

import type { UserDTO } from '@/common/types';
import { CONTENT_WRAPPER_ID, MAIN_PAGE_ID } from '@/client/constants';
import { locales } from '@/client/locales';
import { classNames } from '@/client/utils';
import { tServer } from '@/server/utils/locales';
import { getCurrentUser } from './actions';
import { pickMostRecentConsent, getUserLocale } from '@/common/utils';
import { QUERY_KEYS } from '@/client/request/queryClient';
import type { CookieConsent } from '@/common/types/cookie-consent';
import { ENV_CONFIG_PUBLIC, CONSENT_VERSION } from '@/common/constants';

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

export default async function RootLayout({
    children
}: Readonly<{
    children: React.ReactNode;
}>) {
    const qc = new QueryClient();

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

        user = await getCurrentUser();
    } catch (error: unknown) {
        user = null;
    }

    /**
     * There is no need to fetch through react-query here. the api client would be called anyway and no
     * functionality from rq is needed, it would only make the code more cluttered.
     */
    qc.setQueryData(QUERY_KEYS.auth.currentUser, user);

    //|-----------------------------------------------------------------------------------------|//
    //?                                      COOKIE CONSENT                                     ?//
    //|-----------------------------------------------------------------------------------------|//

    let cookieConsent: CookieConsent | null = null;

    const rawConsent = cookieStore.get('cookie_consent')?.value;

    //The user consent should never be fetched from db if revoked, but just to make sure not to mess gdpr up...
    const dbConsent = user?.cookieConsent?.[0]?.revokedAt
        ? null
        : (user?.cookieConsent?.[0] ?? null);

    if (rawConsent) {
        try {
            const parsed = JSON.parse(decodeURIComponent(rawConsent));
            // Validate version - discard if outdated
            cookieConsent = parsed?.version === CONSENT_VERSION ? parsed : null;
        } catch {
            cookieConsent = null;
        }
    }

    // Validate DB consent version - discard if outdated
    const validDbConsent =
        dbConsent?.version === CONSENT_VERSION ? dbConsent : null;

    const validCookieConsent =
        cookieConsent?.version === CONSENT_VERSION ? cookieConsent : null;

    const initialConsent = cookieConsent
        ? pickMostRecentConsent(validCookieConsent, validDbConsent)
        : null;

    //|-----------------------------------------------------------------------------------------|//
    //?                                          THEME                                          ?//
    //|-----------------------------------------------------------------------------------------|//

    const themeFromCookie = initialConsent?.accepted?.includes('preferences')
        ? (cookieStore.get('ui_theme')?.value ?? null)
        : null;

    const canUsePreferences =
        initialConsent?.accepted?.includes('preferences') ?? false;

    const themeFromPreferences = user?.preferences?.theme ?? null;

    const initialTheme = canUsePreferences
        ? ((themeFromCookie ?? themeFromPreferences ?? 'dark') as
              | 'light'
              | 'dark')
        : 'dark';

    //|-----------------------------------------------------------------------------------------|//
    //?                                          RENDER                                         ?//
    //|-----------------------------------------------------------------------------------------|//

    const dehydratedState = dehydrate(qc);

    return (
        <html lang={locale} suppressHydrationWarning>
            <Head />
            <body className={`${kalam.variable} ${openSans.variable}`}>
                <QueryProvider dehydratedState={dehydratedState}>
                    <AppProviders
                        initialTheme={initialTheme}
                        initialConsent={initialConsent}
                        messages={messages}
                        locale={locale}
                    >
                        <ClientShell />
                        <ConsentBanner />
                        <ScrollToTop />
                        <div
                            id={MAIN_PAGE_ID}
                            className="flex flex-col typography-base min-h-screen"
                        >
                            <div className="fixed top-0 left-0 w-screen h-screen page-background z-[-10]" />
                            {/* DO NOT CHANGE THE ORDER OF THESE COMPONENTS (stacking order and z-index issues) */}
                            <TopNavigation />
                            <BottomNavigation />
                            <div
                                id={CONTENT_WRAPPER_ID}
                                className={classNames(
                                    'flex-1 px-2 pt-16 md:px-4 md:pt-24',
                                    'relative'
                                )}
                            >
                                {children}
                            </div>
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
    const cookieStore = await cookies();
    const headerList = await headers();
    const locale = await getUserLocale(cookieStore, headerList);

    const title = tServer(locale, 'meta.site.title');
    const description = tServer(locale, 'meta.site.description');

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
