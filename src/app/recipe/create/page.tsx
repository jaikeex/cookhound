import React from 'react';
import { RecipeCreate } from '@/client/components';
import { verifySessionFromCookie } from '@/server/utils/session';
import { redirectToRestrictedWithLogin } from '@/server/utils/reqwest';

export default async function Page() {
    const result = await verifySessionFromCookie();

    if (!result.isLoggedIn) {
        redirectToRestrictedWithLogin('/recipe/create');
        return;
    }

    return <RecipeCreate />;
}
