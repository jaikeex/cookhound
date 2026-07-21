import React from 'react';
import { ContactTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { getLocalizedMetadata } from '@/server/utils/seo';

export const dynamic = 'force-dynamic';

//|=============================================================================================|//

export default function ContactPage() {
    return <ContactTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.contact.title',
        descriptionKey: 'meta.contact.description'
    });
}
