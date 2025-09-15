import { ProfileTemplate } from '@/client/components/templates/Profile';
import { apiClient } from '@/client/request';
import { ProfileTab } from '@/client/types/core';
import { SESSION_COOKIE_NAME } from '@/common/constants';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { verifySessionFromCookie } from '@/server/utils/session';
import * as React from 'react';

type UserProfilePageParams = {
    readonly params: Promise<
        Readonly<{
            id: string;
        }>
    >;
    readonly searchParams: Promise<{ tab?: ProfileTab }>;
};

export default async function UserProfilePage({
    params,
    searchParams
}: UserProfilePageParams) {
    const paramsResolved = await params;
    const searchParamsResolved = await searchParams;

    const id = Number(paramsResolved.id);

    if (isNaN(id)) notFound();

    const cookieStore = await cookies();
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

    return <ProfileTemplate user={user} initialTab={resolvedTab} />;
}
