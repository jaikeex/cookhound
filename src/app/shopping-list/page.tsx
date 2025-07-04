import React from 'react';
import { apiClient } from '@/client/request';
import { ShoppingListTemplate } from '@/client/components/templates/ShoppingList';
import { verifySessionFromCookie } from '@/server/utils/session';
import { redirectToRestrictedWithLogin } from '@/server/utils/reqwest';

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
