import React from 'react';
import { TooManyRequestsTemplate } from '@/client/components';
import { buildLocalizedMetadata } from '@/server/utils/seo';
import type { Metadata } from 'next';

//|=============================================================================================|//

export default function Page() {
    return <TooManyRequestsTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.too-many-requests.title',
        descriptionKey: 'meta.too-many-requests.description',
        noindex: true
    });
}
