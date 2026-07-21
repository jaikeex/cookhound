import React from 'react';
import { SendResetPasswordEmailTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/server/utils/seo';

export const dynamic = 'force-dynamic';

type ResetPasswordPageParams = {
    readonly searchParams: Promise<{ email: string }>;
};

//|=============================================================================================|//

export default async function ResetPasswordPage({
    searchParams
}: ResetPasswordPageParams) {
    const searchParamsResolved = await searchParams;

    return (
        <SendResetPasswordEmailTemplate email={searchParamsResolved.email} />
    );
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.auth.reset-password.title',
        descriptionKey: 'meta.auth.reset-password.description',
        noindex: true
    });
}
