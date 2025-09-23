import React from 'react';
import { RestrictedTemplate } from '@/client/components';

export const dynamic = 'force-dynamic';

type RestrictedPageProps = Readonly<{
    searchParams: Promise<Readonly<{ anonymous?: boolean; target?: string }>>;
}>;

export default async function Page({ searchParams }: RestrictedPageProps) {
    const searchParamsResolved = await searchParams;
    const anonymous = searchParamsResolved.anonymous ?? false;
    const target = searchParamsResolved.target ?? '/';

    return <RestrictedTemplate anonymous={anonymous} target={target} />;
}
