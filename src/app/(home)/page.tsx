import type { Metadata } from 'next';
import { FrontPageTemplate } from '@/client/components/templates/Dashboard/FrontPage';
import { serverData } from '@/server/data';
import { cookies, headers } from 'next/headers';
import React from 'react';
import {
    generateWebSiteSchema,
    generateOrganizationSchema,
    getLocalizedMetadata
} from '@/server/utils/seo';
import { StructuredData } from '@/client/components';
import { DEFAULT_LOCALE, ENV_CONFIG_PUBLIC } from '@/common/constants';
import { mapServiceErrorForRsc } from '@/server/data/runtime/mapError';

//|=============================================================================================|//

export default async function Home() {
    const locale = DEFAULT_LOCALE;

    const recipesForDisplay = serverData.recipe
        .list(locale, 1, 24)
        .catch((error) => mapServiceErrorForRsc(error, `/`));

    const websiteSchema = generateWebSiteSchema(ENV_CONFIG_PUBLIC.ORIGIN);
    const organizationSchema = generateOrganizationSchema(
        ENV_CONFIG_PUBLIC.ORIGIN
    );

    return (
        <React.Fragment>
            <StructuredData schema={websiteSchema} id="website-jsonld" />
            <StructuredData
                schema={organizationSchema}
                id="organization-jsonld"
            />

            <FrontPageTemplate initialRecipes={recipesForDisplay} />
        </React.Fragment>
    );
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.home.title',
        descriptionKey: 'meta.home.description',
        imageUrl: '/img/banner.avif',
        canonical: ENV_CONFIG_PUBLIC.ORIGIN
    });
}
