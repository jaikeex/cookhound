import React from 'react';
import { LoginTemplate } from '@/client/components';
import { verifySessionFromCookie } from '@/server/utils/session';
import { redirectToRoot } from '@/server/utils/reqwest';

export default async function LoginPage() {
    const result = await verifySessionFromCookie();

    if (result.isLoggedIn) {
        redirectToRoot();
        return;
    }

    return <LoginTemplate />;
}
