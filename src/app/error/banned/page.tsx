import React from 'react';
import { BannedTemplate } from '@/client/components';
import { buildLocalizedMetadata } from '@/server/utils/seo';
import type { Metadata } from 'next';

//|=============================================================================================|//

export default function Page() {
    return <BannedTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.banned.title',
        descriptionKey: 'meta.banned.description',
        noindex: true
    });
}
