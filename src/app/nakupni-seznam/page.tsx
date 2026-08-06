import React from 'react';
import { serverData } from '@/server/data';
import { ShoppingListTemplate } from '@/client/components/templates/ShoppingList';
import { verifySessionFromCookie } from '@/server/utils/session/verify-server';
import { redirectToRestrictedWithLogin } from '@/server/utils/reqwest';
import { ROUTES } from '@/common/constants';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/common/utils/seo';

export const dynamic = 'force-dynamic';

//|=============================================================================================|//

export default async function Page() {
    const result = await verifySessionFromCookie();

    if (!result.isLoggedIn) {
        redirectToRestrictedWithLogin(ROUTES.shoppingList);
        return;
    }

    const { userId } = result.session;

    const shoppingList = await serverData.user.getShoppingList(Number(userId));

    return <ShoppingListTemplate initialData={shoppingList} />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.shopping-list.title',
        descriptionKey: 'meta.shopping-list.description',
        noindex: true
    });
}
