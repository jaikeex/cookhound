import React from 'react';
import { AdminDashboardTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/server/utils/seo';
import { serverData } from '@/server/data';

export const dynamic = 'force-dynamic';

//|=============================================================================================|//

export default async function AdminPage() {
    const stats = serverData.admin.getDashboardStats();

    return <AdminDashboardTemplate stats={stats} />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.admin.title',
        descriptionKey: 'meta.admin.description',
        noindex: true
    });
}
