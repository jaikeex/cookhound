import React from 'react';
import type { Metadata } from 'next';
import { PrivacyTemplate } from '@/client/components';
import { buildLocalizedMetadata } from '@/common/utils/seo';
import { ENV_CONFIG_PUBLIC, ROUTES } from '@/common/constants';

//|=============================================================================================|//

export default function PrivacyPage() {
    return <PrivacyTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.privacy.title',
        descriptionKey: 'meta.privacy.description',
        canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.privacy}`,
        type: 'website'
    });
}
