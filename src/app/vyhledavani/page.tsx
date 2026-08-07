import type { Metadata } from 'next';
import { SearchTemplate } from '@/client/components/templates/Dashboard/Search';
import { serverData } from '@/server/data';
import React from 'react';
import {
    ENV_CONFIG_PUBLIC,
    RECIPE_DISCOVERY_PER_PAGE,
    ROUTES
} from '@/common/constants';
import {
    generateBreadcrumbSchema,
    buildLocalizedMetadata
} from '@/common/utils/seo';
import { StructuredData } from '@/client/components';
import { t } from '@/client/locales';

//|=============================================================================================|//

export default async function SearchPage({
    searchParams
}: Readonly<{
    searchParams: Promise<{ query?: string }>;
}>) {
    const searchQuery = (await searchParams)?.query ?? '';

    // Undefined, not an empty array. With no query the template runs its general
    // list query rather than a search, and an empty array is a real seed - it
    // would seed that list as "there are no recipes at all" and, since a short
    // page ends the infinite query, nothing would ever be fetched.
    const recipesForDisplay = searchQuery
        ? serverData.recipe.search(searchQuery, 1, RECIPE_DISCOVERY_PER_PAGE)
        : Promise.resolve(undefined);

    const breadcrumbItems = [
        {
            name: t('app.general.home'),
            url: ENV_CONFIG_PUBLIC.ORIGIN
        },
        {
            name: searchQuery
                ? t('meta.search.breadcrumb', {
                      query: searchQuery
                  })
                : t('meta.search.breadcrumb-empty'),
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

    if (!q) {
        return buildLocalizedMetadata({
            titleKey: 'meta.search.title',
            descriptionKey: 'meta.search.description',
            canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.search()}`,
            noindex: true
        });
    }

    const capitalised = q.charAt(0).toUpperCase() + q.slice(1);

    const metadata = buildLocalizedMetadata({
        titleKey: 'meta.search.title',
        descriptionKey: 'meta.search.description',
        canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.search(q)}`,
        noindex: true
    });

    return {
        ...metadata,
        title: `${capitalised} | ${metadata.title}`,
        description: t('meta.search.results.description', {
            query: capitalised
        }),
        openGraph: {
            ...metadata.openGraph,
            title: t('meta.search.results.og-title', {
                query: capitalised
            }),
            description: t('meta.search.results.og-description', {
                query: capitalised
            })
        },
        twitter: {
            card: 'summary'
        }
    };
}
