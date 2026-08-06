import { NotFoundTemplate } from '@/client/components';
import React from 'react';
import { buildLocalizedMetadata } from '@/common/utils/seo';
import type { Metadata } from 'next';

//|=============================================================================================|//

export default function NotFoundPage() {
    return <NotFoundTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.not-found.title',
        descriptionKey: 'meta.not-found.description',
        noindex: true
    });
}
