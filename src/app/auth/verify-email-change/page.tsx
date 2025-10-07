import React from 'react';
import { VerifyEmailChangeTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { cookies, headers } from 'next/headers';

export const dynamic = 'force-dynamic';

//|=============================================================================================|//

export default function VerifyEmailChangePage() {
    return <VerifyEmailChangeTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.auth.verify-email-change.title',
        descriptionKey: 'meta.auth.verify-email-change.description',
        noindex: true
    });
}
