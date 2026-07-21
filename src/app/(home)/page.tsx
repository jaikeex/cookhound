import type { Metadata } from 'next';
import { FrontPageTemplate } from '@/client/components/templates/Dashboard/FrontPage';
import { serverData } from '@/server/data';
import React from 'react';
import {
    generateWebSiteSchema,
    generateOrganizationSchema,
    buildLocalizedMetadata
} from '@/server/utils/seo';
import { StructuredData } from '@/client/components';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import { mapServiceErrorForRsc } from '@/server/data/runtime/mapError';

/**
 * The front page is statically rendered and revalidated on a short window so
 * newly accepted recipes surface without a redeploy. Nothing in the request
 * is personalised here - keep it that way, dynamic APIs would force
 * per-request rendering.
 */
export const revalidate = 300;

//|=============================================================================================|//

export default async function Home() {
    const recipesForDisplay = serverData.recipe
        .list(1, 24)
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
    return buildLocalizedMetadata({
        titleKey: 'meta.home.title',
        descriptionKey: 'meta.home.description',
        imageUrl: '/img/banner.avif',
        canonical: ENV_CONFIG_PUBLIC.ORIGIN
    });
}
