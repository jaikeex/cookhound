import React from 'react';
import { ContactTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/server/utils/seo';

//|=============================================================================================|//

export default function ContactPage() {
    return <ContactTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.contact.title',
        descriptionKey: 'meta.contact.description'
    });
}
