import type { Metadata } from 'next';
import { FrontPageTemplate } from '@/client/components/templates/Dashboard/FrontPage';
import { apiClient } from '@/client/request';
import { getUserLocale } from '@/common/utils';
import { cookies, headers } from 'next/headers';
import React from 'react';
import { SESSION_COOKIE_NAME } from '@/common/constants/general';
import {
    generateWebSiteSchema,
    generateOrganizationSchema,
    getLocalizedMetadata
} from '@/server/utils/seo';
import { StructuredData } from '@/client/components';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';

//|=============================================================================================|//

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
