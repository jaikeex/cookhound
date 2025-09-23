import { FrontPageSkeleton } from '@/client/components/templates/Dashboard/FrontPage/skeleton';
import { SearchTemplate } from '@/client/components/templates/Dashboard/Search';
import { apiClient } from '@/client/request';
import { getUserLocale } from '@/common/utils';
import { cookies, headers } from 'next/headers';
import React, { Suspense } from 'react';
import { SESSION_COOKIE_NAME } from '@/common/constants/general';

export const dynamic = 'force-dynamic';

export default async function SearchPage({
    searchParams
}: Readonly<{
    searchParams: Promise<{ query?: string }>;
}>) {
    const searchQuery = (await searchParams)?.query ?? '';

    const cookieStore = await cookies();
    const headerList = await headers();

    const locale = await getUserLocale(cookieStore, headerList);
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const recipesForDisplay = searchQuery
        ? apiClient.recipe.searchRecipes(searchQuery, locale, 1, 24, {
              ...(sessionId
                  ? {
                        headers: { 'Cookie': `session=${sessionId}` }
                    }
                  : {})
          })
        : Promise.resolve([]);

    return (
        <Suspense fallback={<FrontPageSkeleton />}>
            <SearchTemplate
                initialRecipes={recipesForDisplay}
                initialQuery={searchQuery}
            />
        </Suspense>
    );
}
