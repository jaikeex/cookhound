import type { Metadata } from 'next';
import { FilterTemplate } from '@/client/components/templates/Dashboard/Filter';
import React from 'react';
import { ENV_CONFIG_PUBLIC, ROUTES } from '@/common/constants';
import {
    generateBreadcrumbSchema,
    buildLocalizedMetadata
} from '@/server/utils/seo';
import { StructuredData } from '@/client/components';
import { t } from '@/client/locales';
import { deserializeFilterParams } from '@/common/utils';

export const dynamic = 'force-dynamic';

//|=============================================================================================|//

export default async function FilterPage({
    searchParams
}: Readonly<{
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
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

    const breadcrumbItems = [
        {
            name: t('app.general.home'),
            url: ENV_CONFIG_PUBLIC.ORIGIN
        },
        {
            name: t('app.recipe.filter.title'),
            url: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.filter}`
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
    return buildLocalizedMetadata({
        titleKey: 'meta.filter.title',
        descriptionKey: 'meta.filter.description',
        canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.filter}`,
        noindex: true
    });
}
