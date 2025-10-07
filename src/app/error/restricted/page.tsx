import React from 'react';
import { RestrictedTemplate } from '@/client/components';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { cookies, headers } from 'next/headers';
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
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.restricted.title',
        descriptionKey: 'meta.restricted.description',
        noindex: true
    });
}
