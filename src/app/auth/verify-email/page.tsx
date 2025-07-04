import React from 'react';
import { VerifyEmailTemplate } from '@/client/components';
import { verifySessionFromCookie } from '@/server/utils/session';
import { redirectToRoot } from '@/server/utils/reqwest';

export default async function Page() {
    const result = await verifySessionFromCookie();

    if (result.isLoggedIn) {
        redirectToRoot();
        return;
    }

    return <VerifyEmailTemplate />;
}
