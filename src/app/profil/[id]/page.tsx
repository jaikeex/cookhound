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
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { verifySessionFromCookie } from '@/server/utils/session/verify-server';
import React from 'react';
import { buildLocalizedMetadata } from '@/server/utils/seo';
import { UserStructuredData } from '@/client/components';

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

    // Resolve the user BEFORE any redirect or JSX. If the fetch only failed
    // later, deep inside the render, the response status would already be
    // committed as 200 and a missing user would be served as a soft 404.
    const user = await serverData.user
        .getById(id)
        .catch((error) => mapServiceErrorForRsc(error, ROUTES.user.detail(id)));

    const cookieStore = await cookies();
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

    return (
        <React.Fragment>
            <ProfileTemplate user={user} initialTab={resolvedTab} />
            <UserStructuredData user={user} />
        </React.Fragment>
    );
}

//|=============================================================================================|//

export async function generateMetadata({
    params
}: UserProfilePageParams): Promise<Metadata> {
    const { id } = await params;
    const numericId = Number(id);

    if (isNaN(numericId)) {
        return buildLocalizedMetadata({
            titleKey: 'meta.user.fallback.title',
            descriptionKey: 'meta.user.fallback.description',
            noindex: true
        });
    }

    try {
        const user = await serverData.user.getById(numericId);

        return buildLocalizedMetadata({
            titleKey: 'meta.user.title',
            descriptionKey: 'meta.user.description',
            images: user.avatarUrl ? [user.avatarUrl] : ['/img/anonymous.webp'],
            twitterCard: 'summary',
            params: { username: user.username },
            canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.user.detail(numericId)}`,
            type: 'profile'
        });
    } catch {
        return buildLocalizedMetadata({
            titleKey: 'meta.user.fallback.title',
            descriptionKey: 'meta.user.fallback.description',
            noindex: true
        });
    }
}
