import React from 'react';
import type { Metadata } from 'next';
import { PrivacyTemplate } from '@/client/components';
import { buildLocalizedMetadata } from '@/server/utils/seo';

//|=============================================================================================|//

export default function PrivacyPage() {
    return <PrivacyTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return await buildLocalizedMetadata({
        titleKey: 'meta.privacy.title',
        descriptionKey: 'meta.privacy.description',
        type: 'website'
    });
}
