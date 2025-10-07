import type { Metadata } from 'next';
import { ProfileTemplate } from '@/client/components/templates/Profile';
import { apiClient } from '@/client/request';
import { ProfileTab } from '@/client/types/core';
import { SESSION_COOKIE_NAME, ENV_CONFIG_PUBLIC } from '@/common/constants';
import { cookies, headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { verifySessionFromCookie } from '@/server/utils/session';
import React from 'react';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { UserStructuredData } from '@/client/components';
import { getUserLocale } from '@/common/utils';

type UserProfilePageParams = {
    readonly params: Promise<
        Readonly<{
            id: string;
        }>
    >;
    readonly searchParams: Promise<{ tab?: ProfileTab }>;
};

//|=============================================================================================|//

export default async function UserProfilePage({
    params,
    searchParams
}: UserProfilePageParams) {
    const paramsResolved = await params;
    const searchParamsResolved = await searchParams;

    const id = Number(paramsResolved.id);

    if (isNaN(id)) notFound();

    /**
     * Get the locale for the structured ld data. This must be done here because
     * next will throw if cookies are called from a components folder...
     * I was not able to find out why so here it stays.
     */
    const cookieStore = await cookies();
    const headerList = await headers();

    const locale = await getUserLocale(cookieStore, headerList);

    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    // Check whether the caller is the profile owner
    let isCurrentUser = false;

    if (sessionId) {
        const { isLoggedIn, session } = await verifySessionFromCookie();
        isCurrentUser = isLoggedIn && session?.userId === id;
    }

    // Get the correct tab to display
    const incomingTab = searchParamsResolved.tab ?? null;

    let resolvedTab: ProfileTab;

    if (!incomingTab) {
        resolvedTab = isCurrentUser ? ProfileTab.Dashboard : ProfileTab.Recipes;
    } else if (incomingTab === ProfileTab.Dashboard && !isCurrentUser) {
        resolvedTab = ProfileTab.Recipes;
    } else {
        resolvedTab = incomingTab;
    }

    if (resolvedTab !== incomingTab) {
        redirect(`/user/${id}?tab=${resolvedTab}`);
    }

    const user = apiClient.user.getUserById(id, {
        ...(sessionId
            ? {
                  headers: { 'Cookie': `session=${sessionId}` }
              }
            : {})
    });

    return (
        <React.Fragment>
            <ProfileTemplate user={user} initialTab={resolvedTab} />
            <UserStructuredData userPromise={user} locale={locale} />
        </React.Fragment>
    );
}

//|=============================================================================================|//

export async function generateMetadata({
    params
}: UserProfilePageParams): Promise<Metadata> {
    const { id } = await params;
    const numericId = Number(id);
    const cookieStore = await cookies();
    const headerList = await headers();

    if (isNaN(numericId)) {
        const metadata = await getLocalizedMetadata(cookieStore, headerList, {
            titleKey: 'meta.user.fallback.title',
            descriptionKey: 'meta.user.fallback.description'
        });

        return {
            ...metadata,
            robots: 'noindex'
        };
    }

    try {
        const user = await apiClient.user.getUserById(numericId, {});

        return getLocalizedMetadata(cookieStore, headerList, {
            titleKey: 'meta.user.title',
            descriptionKey: 'meta.user.description',
            images: user.avatarUrl ? [user.avatarUrl] : ['/img/anonymous.webp'],
            twitterCard: 'summary',
            params: { username: user.username },
            canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}/user/${numericId}`,
            type: 'profile'
        });
    } catch {
        const metadata = await getLocalizedMetadata(cookieStore, headerList, {
            titleKey: 'meta.user.fallback.title',
            descriptionKey: 'meta.user.fallback.description'
        });

        return {
            ...metadata,
            robots: 'noindex'
        };
    }
}
