import React from 'react';
import { VerifyEmailTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/server/utils/seo';

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
    return buildLocalizedMetadata({
        titleKey: 'meta.auth.verify-email.title',
        descriptionKey: 'meta.auth.verify-email.description',
        noindex: true
    });
}
