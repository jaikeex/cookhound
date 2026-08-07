import React from 'react';
import type { Metadata } from 'next';
import { TermsTemplate } from '@/client/components';
import { buildLocalizedMetadata } from '@/common/utils/seo';
import { ENV_CONFIG_PUBLIC, ROUTES } from '@/common/constants';

//|=============================================================================================|//

export default function TermsPage() {
    return <TermsTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.terms.title',
        descriptionKey: 'meta.terms.description',
        canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.terms}`,
        type: 'website'
    });
}
