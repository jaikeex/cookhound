import React from 'react';
import { serverData } from '@/server/data';
import { ensureRenderContext } from '@/server/data/runtime/ensureContext';
import { ShoppingListTemplate } from '@/client/components/templates/ShoppingList';
import { RequestContext } from '@/server/utils/reqwest/context';
import { redirectToRestrictedWithLogin } from '@/server/utils/reqwest';
import { ROUTES } from '@/common/constants';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/common/utils/seo';

export const dynamic = 'force-dynamic';

//|=============================================================================================|//

export default async function Page() {
    //~-----------------------------------------------------------------------------------------~//
    //$                                 ONE CONTEXT PER RENDER                                  $//
    //
    // The auth check and the read below both need the caller. Opening one context here resolves
    // the session once and lets getShoppingList short-circuit its own ensureRenderContext,
    // rather than each of them validating the session separately.
    //
    // The check is not the access control - getShoppingList runs assertSelf() against this same
    // context and stays the real guard. It only exists to send an anonymous visitor to the login
    // wall instead of to an error page.
    //
    // Note the viewer degrades to "guest" when the session lookup itself fails (buildContext
    // swallows its own errors), which walls a logged in user where verifySessionFromCookie used
    // to throw. Neither outcome is good, and the wall at least offers a way forward.
    //~-----------------------------------------------------------------------------------------~//

    return ensureRenderContext(async () => {
        const viewerId = RequestContext.getUserId();

        if (!viewerId) {
            redirectToRestrictedWithLogin(ROUTES.shoppingList);
            return;
        }

        const shoppingList = await serverData.user.getShoppingList(viewerId);

        return <ShoppingListTemplate initialData={shoppingList} />;
    });
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.shopping-list.title',
        descriptionKey: 'meta.shopping-list.description',
        noindex: true
    });
}
