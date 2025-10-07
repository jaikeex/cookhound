import React from 'react';
import { VerifyEmailTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { cookies, headers } from 'next/headers';

export const dynamic = 'force-dynamic';

//|=============================================================================================|//

export default async function VerifyEmailPage({
    searchParams
}: Readonly<{
    searchParams: Promise<{ new?: string }>;
}>) {
    const searchParamsData = await searchParams;
    const newParam = searchParamsData?.new === 'false' ? false : true;

    return <VerifyEmailTemplate new={newParam} />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.auth.verify-email.title',
        descriptionKey: 'meta.auth.verify-email.description',
        noindex: true
    });
}
