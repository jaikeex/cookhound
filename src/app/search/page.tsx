import type { Metadata } from 'next';
import { SearchTemplate } from '@/client/components/templates/Dashboard/Search';
import { apiClient } from '@/client/request';
import { getUserLocale } from '@/common/utils';
import { cookies, headers } from 'next/headers';
import React from 'react';
import { SESSION_COOKIE_NAME, ENV_CONFIG_PUBLIC } from '@/common/constants';
import {
    generateBreadcrumbSchema,
    getLocalizedMetadata
} from '@/server/utils/seo';
import { StructuredData } from '@/client/components';
import { tServer } from '@/server/utils/locales';

export const dynamic = 'force-dynamic';

//|=============================================================================================|//

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

    const breadcrumbItems = [
        {
            name: tServer(locale, 'app.general.home'),
            url: ENV_CONFIG_PUBLIC.ORIGIN
        },
        {
            name: searchQuery ? `Search: ${searchQuery}` : 'Search',
            url: searchQuery
                ? `${ENV_CONFIG_PUBLIC.ORIGIN}/search?query=${encodeURIComponent(searchQuery)}`
                : `${ENV_CONFIG_PUBLIC.ORIGIN}/search`
        }
    ];

    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

    return (
        <React.Fragment>
            <StructuredData schema={breadcrumbSchema} id="breadcrumb-jsonld" />
            <SearchTemplate
                initialRecipes={recipesForDisplay}
                initialQuery={searchQuery}
            />
        </React.Fragment>
    );
}

//|=============================================================================================|//

export async function generateMetadata({
    searchParams
}: {
    searchParams: Promise<{ query?: string }>;
}): Promise<Metadata> {
    const { query } = await searchParams;
    const q = query ?? '';
    const cookieStore = await cookies();
    const headerList = await headers();

    if (!q) {
        return await getLocalizedMetadata(cookieStore, headerList, {
            titleKey: 'meta.search.title',
            descriptionKey: 'meta.search.description',
            canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}/search`,
            noindex: true
        });
    }

    const capitalised = q.charAt(0).toUpperCase() + q.slice(1);

    const metadata = await getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.search.title',
        descriptionKey: 'meta.search.description',
        canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}/search?query=${encodeURIComponent(q)}`,
        noindex: true
    });

    return {
        ...metadata,
        title: `${capitalised} | ${metadata.title}`,
        description: `Results for ${capitalised} recipes on Cookhound.`,
        openGraph: {
            ...metadata.openGraph,
            title: `Search results for ${capitalised}`,
            description: `Discover delicious ${capitalised} recipes shared by the community.`
        },
        twitter: {
            card: 'summary'
        }
    };
}
