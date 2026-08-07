import React from 'react';
import { ContactTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/common/utils/seo';
import { ENV_CONFIG_PUBLIC, ROUTES } from '@/common/constants';

//|=============================================================================================|//

export default function ContactPage() {
    return <ContactTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.contact.title',
        descriptionKey: 'meta.contact.description',
        canonical: `${ENV_CONFIG_PUBLIC.ORIGIN}${ROUTES.contact}`
    });
}
