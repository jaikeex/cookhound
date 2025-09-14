import { ProfileTemplate } from '@/client/components/templates/Profile';
import { apiClient } from '@/client/request';
import { SESSION_COOKIE_NAME } from '@/common/constants';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import * as React from 'react';

type UserProfilePageParams = {
    readonly params: Promise<
        Readonly<{
            id: string;
        }>
    >;
};

export default async function UserProfilePage({
    params
}: UserProfilePageParams) {
    const paramsResolved = await params;
    const id = Number(paramsResolved.id);

    if (isNaN(id)) notFound();

    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const user = apiClient.user.getUserById(id, {
        ...(sessionId
            ? {
                  headers: { 'Cookie': `session=${sessionId}` }
              }
            : {})
    });

    return <ProfileTemplate user={user} />;
}
