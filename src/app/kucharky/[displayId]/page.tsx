import React from 'react';
import { serverData } from '@/server/data';
import { mapServiceErrorForRsc } from '@/server/data/runtime/mapError';
import { CookbookVisibility } from '@/common/types';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/app/actions';
import { CookbookTemplate, StructuredData } from '@/client/components';
import type { Metadata } from 'next';
import { ENV_CONFIG_PUBLIC, ROUTES } from '@/common/constants';
import {
    generateCookbookSchema,
    generateBreadcrumbSchema,
    buildLocalizedMetadata
} from '@/common/utils/seo';
import { t } from '@/client/locales';

type CookbookPageParams = {
    readonly params: Promise<
        Readonly<{
            displayId: string;
        }>
    >;
};

//|=============================================================================================|//

export default async function Page({ params }: CookbookPageParams) {
    const paramsResolved = await params;
    const cookbookDisplayId = paramsResolved.displayId;

    const [user, cookbook] = await Promise.all([
        getCurrentUser(),
        serverData.cookbook
            .getByDisplayId(cookbookDisplayId)
            .catch((error) =>
                mapServiceErrorForRsc(
                    error,
                    ROUTES.cookbook.detail(cookbookDisplayId)
                )
            )
    ]);

    const isOwner = cookbook?.ownerId === user?.id;
    const isPublic = cookbook?.visibility === CookbookVisibility.PUBLIC;

    const isVisible = isOwner || isPublic;

    if (!isVisible) {
        notFound();
    }

    const cookbookSchema =
        isPublic && cookbook
            ? generateCookbookSchema(cookbook, ENV_CONFIG_PUBLIC.ORIGIN)
            : null;

    const breadcrumbSchema =
        isPublic && cookbook
            ? generateBreadcrumbSchema([
                  {
                      name: t('app.general.home'),
                      url: ENV_CONFIG_PUBLIC.ORIGIN
                  },
                  {
                      name: user?.username ?? 'User',
                      url: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.user.detail(cookbook.ownerId)}`
                  },
                  {
                      name: cookbook.title,
                      url: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.cookbook.detail(cookbookDisplayId)}`
                  }
              ])
            : null;

    return (
        <React.Fragment>
            {cookbookSchema ? (
                <StructuredData schema={cookbookSchema} id="cookbook-jsonld" />
            ) : null}
            {breadcrumbSchema ? (
                <StructuredData
                    schema={breadcrumbSchema}
                    id="breadcrumb-jsonld"
                />
            ) : null}

            <CookbookTemplate cookbook={cookbook} />
        </React.Fragment>
    );
}

//|=============================================================================================|//

export async function generateMetadata({
    params
}: CookbookPageParams): Promise<Metadata> {
    const { displayId } = await params;

    try {
        const cookbook = await serverData.cookbook.getByDisplayId(displayId);

        const canonical = `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.cookbook.detail(displayId)}`;

        const metadata = buildLocalizedMetadata({
            titleKey: 'meta.cookbook.title',
            descriptionKey: 'meta.cookbook.description',
            images: cookbook.coverImageUrl ? [cookbook.coverImageUrl] : [],
            twitterCard: 'summary_large_image',
            params: { cookbookTitle: cookbook.title },
            canonical,
            type: 'article',
            publishedTime: cookbook.createdAt?.toISOString(),
            modifiedTime:
                cookbook.updatedAt?.toISOString() ??
                cookbook.createdAt?.toISOString(),
            authors: [cookbook.ownerId?.toString() ?? 'Cookhound User']
        });

        if (cookbook.description) {
            return {
                ...metadata,
                description: cookbook.description.slice(0, 160),
                openGraph: {
                    ...metadata.openGraph,
                    description: cookbook.description.slice(0, 200)
                }
            };
        }

        return metadata;
    } catch {
        const canonical = `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.cookbook.detail(displayId)}`;

        const metadata = buildLocalizedMetadata({
            titleKey: 'meta.cookbook.fallback.title',
            descriptionKey: 'meta.cookbook.fallback.description',
            canonical
        });

        return {
            ...metadata,
            robots: 'noindex'
        };
    }
}
