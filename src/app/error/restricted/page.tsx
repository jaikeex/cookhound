import React from 'react';
import { RestrictedTemplate } from '@/client/components';
import { buildLocalizedMetadata } from '@/server/utils/seo';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type RestrictedPageProps = Readonly<{
    searchParams: Promise<Readonly<{ anonymous?: boolean; target?: string }>>;
}>;

//|=============================================================================================|//

export default async function Page({ searchParams }: RestrictedPageProps) {
    const searchParamsResolved = await searchParams;
    const anonymous = searchParamsResolved.anonymous ?? false;
    const target = searchParamsResolved.target ?? '/';

    return <RestrictedTemplate anonymous={anonymous} target={target} />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.restricted.title',
        descriptionKey: 'meta.restricted.description',
        noindex: true
    });
}
