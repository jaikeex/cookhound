import React from 'react';
import { apiClient } from '@/client/request';
import { CookbookVisibility } from '@/common/types';
import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/app/actions';
import { CookbookTemplate, StructuredData } from '@/client/components';
import type { Metadata } from 'next';
import type { CookbookDTO } from '@/common/types';
import { cookies, headers } from 'next/headers';
import { ENV_CONFIG_PUBLIC } from '@/common/constants';
import {
    generateCookbookSchema,
    generateBreadcrumbSchema,
    getLocalizedMetadata
} from '@/server/utils/seo';
import { tServer } from '@/server/utils/locales';
import { getUserLocale } from '@/common/utils';

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
        apiClient.cookbook.getCookbookByDisplayId(cookbookDisplayId, {
            revalidate: 3600
        })
    ]);

    const cookieStore = await cookies();
    const headerList = await headers();
    const locale = await getUserLocale(cookieStore, headerList);

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
                      name: tServer(locale, 'app.general.home'),
                      url: ENV_CONFIG_PUBLIC.ORIGIN
                  },
                  {
                      name: user?.username ?? 'User',
                      url: `${ENV_CONFIG_PUBLIC.ORIGIN}/user/${cookbook.ownerId}`
                  },
                  {
                      name: cookbook.title,
                      url: `${ENV_CONFIG_PUBLIC.ORIGIN}/cookbooks/${cookbookDisplayId}`
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
    const cookieStore = await cookies();
    const headerList = await headers();

    try {
        const cookbook: CookbookDTO =
            await apiClient.cookbook.getCookbookByDisplayId(displayId, {
                revalidate: 3600
            });

        const canonical = `${ENV_CONFIG_PUBLIC.ORIGIN}/cookbooks/${displayId}`;

        const metadata = await getLocalizedMetadata(cookieStore, headerList, {
            titleKey: 'meta.cookbook.title',
            descriptionKey: 'meta.cookbook.description',
            images: cookbook.coverImageUrl ? [cookbook.coverImageUrl] : [],
            twitterCard: 'summary_large_image',
            params: { cookbookTitle: cookbook.title },
            canonical,
            type: 'article',
            publishedTime: cookbook.createdAt.toISOString(),
            modifiedTime:
                cookbook.updatedAt?.toISOString() ??
                cookbook.createdAt.toISOString(),
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
        const canonical = `${ENV_CONFIG_PUBLIC.ORIGIN}/cookbooks/${displayId}`;

        const metadata = await getLocalizedMetadata(cookieStore, headerList, {
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
