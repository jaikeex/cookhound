import { NotFoundTemplate } from '@/client/components';
import React from 'react';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { cookies, headers } from 'next/headers';
import type { Metadata } from 'next';

//|=============================================================================================|//

export default function NotFoundPage() {
    return <NotFoundTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return await getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.not-found.title',
        descriptionKey: 'meta.not-found.description',
        noindex: true
    });
}
