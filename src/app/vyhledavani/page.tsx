import type { Metadata } from 'next';
import { SearchTemplate } from '@/client/components/templates/Dashboard/Search';
import { serverData } from '@/server/data';
import { cookies, headers } from 'next/headers';
import React from 'react';
import { DEFAULT_LOCALE, ENV_CONFIG_PUBLIC, ROUTES } from '@/common/constants';
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

    const locale = DEFAULT_LOCALE;

    const recipesForDisplay = searchQuery
        ? serverData.recipe.search(searchQuery, locale, 1, 24)
        : Promise.resolve([]);

    const breadcrumbItems = [
        {
            name: tServer(locale, 'app.general.home'),
            url: ENV_CONFIG_PUBLIC.ORIGIN
        },
        {
            name: searchQuery
                ? tServer(locale, 'meta.search.breadcrumb', {
                      query: searchQuery
                  })
                : tServer(locale, 'meta.search.breadcrumb-empty'),
            url: searchQuery
                ? `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.search(searchQuery)}`
                : `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.search()}`
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
            canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.search()}`,
            noindex: true
        });
    }

    const capitalised = q.charAt(0).toUpperCase() + q.slice(1);
    const locale = DEFAULT_LOCALE;

    const metadata = await getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.search.title',
        descriptionKey: 'meta.search.description',
        canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.search(q)}`,
        noindex: true
    });

    return {
        ...metadata,
        title: `${capitalised} | ${metadata.title}`,
        description: tServer(locale, 'meta.search.results.description', {
            query: capitalised
        }),
        openGraph: {
            ...metadata.openGraph,
            title: tServer(locale, 'meta.search.results.og-title', {
                query: capitalised
            }),
            description: tServer(locale, 'meta.search.results.og-description', {
                query: capitalised
            })
        },
        twitter: {
            card: 'summary'
        }
    };
}
