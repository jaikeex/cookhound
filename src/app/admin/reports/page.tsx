import React from 'react';
import { AdminReportsTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/server/utils/seo';

//|=============================================================================================|//

export default function AdminReportsPage() {
    return <AdminReportsTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.admin.reports.title',
        descriptionKey: 'meta.admin.reports.description',
        noindex: true
    });
}
