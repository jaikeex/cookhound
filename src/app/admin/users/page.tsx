import React from 'react';
import { AdminUsersTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/server/utils/seo';

//|=============================================================================================|//

export default function AdminUsersPage() {
    return <AdminUsersTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.admin.users.title',
        descriptionKey: 'meta.admin.users.description',
        noindex: true
    });
}
