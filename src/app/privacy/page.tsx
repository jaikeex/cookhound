import React from 'react';
import type { Metadata } from 'next';
import { PrivacyTemplate } from '@/client/components';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { cookies, headers } from 'next/headers';

//|=============================================================================================|//

export default function PrivacyPage() {
    return <PrivacyTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return await getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.privacy.title',
        descriptionKey: 'meta.privacy.description',
        type: 'website'
    });
}
