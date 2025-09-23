import React from 'react';
import { ChangeEmailTemplate } from '@/client/components';
import { verifySessionFromCookie } from '@/server/utils/session';
import { redirectToRestrictedWithLogin } from '@/server/utils/reqwest';

export default async function Page() {
    const result = await verifySessionFromCookie();

    if (!result.isLoggedIn) {
        redirectToRestrictedWithLogin('/user/change-email');
        return null;
    }

    return <ChangeEmailTemplate />;
}
