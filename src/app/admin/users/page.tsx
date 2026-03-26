import React from 'react';
import { AdminUsersTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { getLocalizedMetadata } from '@/server/utils/seo';

//|=============================================================================================|//

export default function AdminUsersPage() {
    return <AdminUsersTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.admin.users.title',
        descriptionKey: 'meta.admin.users.description',
        noindex: true
    });
}
