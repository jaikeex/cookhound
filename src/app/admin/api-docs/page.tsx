import React from 'react';
import { AdminApiDocsTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/common/utils/seo';
import { collectApiDocs } from '@/server/utils/api-docs';

//|=============================================================================================|//

export const dynamic = 'force-dynamic';

export default function AdminApiDocsPage() {
    const data = collectApiDocs();

    return <AdminApiDocsTemplate data={data} />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.admin.apiDocs.title',
        descriptionKey: 'meta.admin.apiDocs.description',
        noindex: true
    });
}
