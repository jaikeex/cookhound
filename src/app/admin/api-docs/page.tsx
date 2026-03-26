import React from 'react';
import { AdminApiDocsTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { collectApiDocs } from '@/server/utils/api-docs';

//|=============================================================================================|//

export const dynamic = 'force-dynamic';

export default function AdminApiDocsPage() {
    const data = collectApiDocs();

    return <AdminApiDocsTemplate data={data} />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.admin.apiDocs.title',
        descriptionKey: 'meta.admin.apiDocs.description',
        noindex: true
    });
}
