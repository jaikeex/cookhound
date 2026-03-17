import React from 'react';
import { AdminDashboardTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { SESSION_COOKIE_NAME } from '@/common/constants';
import { apiClient } from '@/client/request';

//|=============================================================================================|//

export default async function AdminPage() {
    const cookieStore = await cookies();

    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    const stats = apiClient.admin.getDashboardStats({
        cache: 'no-store',
        ...(sessionId
            ? {
                  headers: { 'Cookie': `session=${sessionId}` }
              }
            : {})
    });

    return <AdminDashboardTemplate stats={stats} />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.admin.title',
        descriptionKey: 'meta.admin.description',
        noindex: true
    });
}
