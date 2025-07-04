import React from 'react';
import { RegisterTemplate } from '@/client/components';
import { verifySessionFromCookie } from '@/server/utils/session';
import { redirectToRoot } from '@/server/utils/reqwest';

export default async function RegisterPage() {
    const result = await verifySessionFromCookie();

    if (result.isLoggedIn) {
        redirectToRoot();
        return;
    }
    return <RegisterTemplate />;
}
