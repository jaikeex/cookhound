import React from 'react';
import { apiClient } from '@/client/request';
import { ShoppingListTemplate } from '@/client/components/templates/ShoppingList';
import { verifySessionFromCookie } from '@/server/utils/session';
import { redirectToRestrictedWithLogin } from '@/server/utils/reqwest';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { getLocalizedMetadata } from '@/server/utils/seo';

export const dynamic = 'force-dynamic';

//|=============================================================================================|//

export default async function Page() {
    const result = await verifySessionFromCookie();

    if (!result.isLoggedIn) {
        redirectToRestrictedWithLogin('/shopping-list');
        return;
    }

    const { userId, sessionId } = result.session;

    const shoppingList = await apiClient.user.getShoppingList(Number(userId), {
        ...(userId
            ? {
                  headers: {
                      'Cookie': `session=${sessionId}`
                  }
              }
            : {})
    });

    return <ShoppingListTemplate initialData={shoppingList} />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return await getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.shopping-list.title',
        descriptionKey: 'meta.shopping-list.description',
        noindex: true
    });
}
