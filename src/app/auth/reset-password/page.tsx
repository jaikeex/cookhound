import React from 'react';
import { SendResetPasswordEmailTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { cookies, headers } from 'next/headers';

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
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.auth.reset-password.title',
        descriptionKey: 'meta.auth.reset-password.description',
        noindex: true
    });
}
