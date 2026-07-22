import React from 'react';
import { ChangeEmailTemplate } from '@/client/components';
import { verifySessionFromCookie } from '@/server/utils/session/verify-server';
import { redirectToRestrictedWithLogin } from '@/server/utils/reqwest';
import { ROUTES } from '@/common/constants';
import type { Metadata } from 'next';

//|=============================================================================================|//

export default async function Page() {
    const result = await verifySessionFromCookie();

    if (!result.isLoggedIn) {
        redirectToRestrictedWithLogin(ROUTES.user.changeEmail);
        return null;
    }

    return <ChangeEmailTemplate />;
}

//|=============================================================================================|//

export const metadata: Metadata = {
    title: 'Change Email | Cookhound',
    description: 'Update your email address on Cookhound.',
    robots: {
        index: false,
        follow: false
    }
};
