import React from 'react';
import { RegisterTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { getLocalizedMetadata } from '@/server/utils/seo';
import { cookies, headers } from 'next/headers';

export const dynamic = 'force-dynamic';

//|=============================================================================================|//

export default function RegisterPage() {
    return <RegisterTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.auth.register.title',
        descriptionKey: 'meta.auth.register.description',
        noindex: true
    });
}
