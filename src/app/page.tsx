import { FrontPageTemplate } from '@/client/components/templates/Dashboard/FrontPage';
import { FrontPageSkeleton } from '@/client/components/templates/Dashboard/FrontPage/skeleton';
import { apiClient } from '@/client/request';
import { getUserLocale } from '@/common/utils';
import { cookies, headers } from 'next/headers';
import React, { Suspense } from 'react';
import { SESSION_COOKIE_NAME } from '@/common/constants/general';

export default async function Home() {
    const cookieStore = await cookies();
    const headerList = await headers();

    const locale = await getUserLocale(cookieStore, headerList);
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const recipesForDisplay = apiClient.recipe.getRecipeList(locale, 1, 24, {
        ...(sessionId
            ? {
                  headers: { 'Cookie': `session=${sessionId}` }
              }
            : {})
    });

    return (
        <Suspense fallback={<FrontPageSkeleton />}>
            <FrontPageTemplate initialRecipes={recipesForDisplay} />
        </Suspense>
    );
}
