import React from 'react';
import type { Metadata } from 'next';
import { TermsTemplate } from '@/client/components';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { cookies, headers } from 'next/headers';

//|=============================================================================================|//

export default function TermsPage() {
    return <TermsTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return await getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.terms.title',
        descriptionKey: 'meta.terms.description',
        type: 'website'
    });
}
