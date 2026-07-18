import type { Metadata } from 'next';
import { ProfileTemplate } from '@/client/components/templates/Profile';
import { serverData } from '@/server/data';
import { mapServiceErrorForRsc } from '@/server/data/runtime/mapError';
import { ProfileTab } from '@/client/types/core';
import {
    SESSION_COOKIE_NAME,
    ENV_CONFIG_PUBLIC,
    ROUTES
} from '@/common/constants';
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

    // Check whether the caller is the profile owner, this is important for the default tab
    // displayed and to hide sensitive info from impostors.
    let isCurrentUser = false;

    if (sessionId) {
        const { isLoggedIn, session } = await verifySessionFromCookie();
        isCurrentUser = isLoggedIn && session?.userId === id;
    }

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
        redirect(`${ROUTES.user.detail(id)}?tab=${resolvedTab}`);
    }

    const user = serverData.user
        .getById(id)
        .catch((error) => mapServiceErrorForRsc(error, ROUTES.user.detail(id)));

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
        return await getLocalizedMetadata(cookieStore, headerList, {
            titleKey: 'meta.user.fallback.title',
            descriptionKey: 'meta.user.fallback.description',
            noindex: true
        });
    }

    try {
        const user = await serverData.user.getById(numericId);

        return await getLocalizedMetadata(cookieStore, headerList, {
            titleKey: 'meta.user.title',
            descriptionKey: 'meta.user.description',
            images: user.avatarUrl ? [user.avatarUrl] : ['/img/anonymous.webp'],
            twitterCard: 'summary',
            params: { username: user.username },
            canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.user.detail(numericId)}`,
            type: 'profile'
        });
    } catch {
        return await getLocalizedMetadata(cookieStore, headerList, {
            titleKey: 'meta.user.fallback.title',
            descriptionKey: 'meta.user.fallback.description',
            noindex: true
        });
    }
}
