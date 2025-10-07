import React from 'react';
import { TooManyRequestsTemplate } from '@/client/components';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { cookies, headers } from 'next/headers';
import type { Metadata } from 'next';

//|=============================================================================================|//

export default function Page() {
    return <TooManyRequestsTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.too-many-requests.title',
        descriptionKey: 'meta.too-many-requests.description',
        noindex: true
    });
}
