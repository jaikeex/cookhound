import React from 'react';
import type { Metadata } from 'next';
import { TermsTemplate } from '@/client/components';
import { buildLocalizedMetadata } from '@/server/utils/seo';

//|=============================================================================================|//

export default function TermsPage() {
    return <TermsTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.terms.title',
        descriptionKey: 'meta.terms.description',
        type: 'website'
    });
}
