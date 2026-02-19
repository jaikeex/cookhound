import type { Metadata } from 'next';
import { FilterTemplate } from '@/client/components/templates/Dashboard/Filter';
import { cookies, headers } from 'next/headers';
import React from 'react';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import {
    generateBreadcrumbSchema,
    getLocalizedMetadata
} from '@/server/utils/seo';
import { StructuredData } from '@/client/components';
import { tServer } from '@/server/utils/locales';
import { deserializeFilterParams, getUserLocale } from '@/common/utils';

export const dynamic = 'force-dynamic';

//|=============================================================================================|//

export default async function FilterPage({
    searchParams
}: Readonly<{
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
    const cookieStore = await cookies();
    const headerList = await headers();

    const rawParams = await searchParams;
    const urlSearchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(rawParams)) {
        if (Array.isArray(value)) {
            value.forEach((v) => urlSearchParams.append(key, v));
        } else if (value !== undefined) {
            urlSearchParams.set(key, value);
        }
    }

    const initialFilters = deserializeFilterParams(urlSearchParams);

    const locale = await getUserLocale(cookieStore, headerList);

    const breadcrumbItems = [
        {
            name: tServer(locale, 'app.general.home'),
            url: ENV_CONFIG_PUBLIC.ORIGIN
        },
        {
            name: tServer(locale, 'app.recipe.filter.title'),
            url: `${ENV_CONFIG_PUBLIC.ORIGIN}/filter`
        }
    ];

    const breadcrumbSchema = generateBreadcrumbSchema(breadcrumbItems);

    return (
        <React.Fragment>
            <StructuredData schema={breadcrumbSchema} id="breadcrumb-jsonld" />
            <FilterTemplate initialFilters={initialFilters} />
        </React.Fragment>
    );
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.filter.title',
        descriptionKey: 'meta.filter.description',
        canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}/filter`,
        noindex: true
    });
}
