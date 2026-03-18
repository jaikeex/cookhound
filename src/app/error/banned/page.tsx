import React from 'react';
import { BannedTemplate } from '@/client/components';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { cookies, headers } from 'next/headers';
import type { Metadata } from 'next';

//|=============================================================================================|//

export default function Page() {
    return <BannedTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.banned.title',
        descriptionKey: 'meta.banned.description',
        noindex: true
    });
}
