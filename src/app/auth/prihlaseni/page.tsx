import React from 'react';
import { LoginTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { cookies, headers } from 'next/headers';
import { getLocalizedMetadata } from '@/server/utils/seo';

export const dynamic = 'force-dynamic';

//|=============================================================================================|//

export default function LoginPage() {
    return <LoginTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const headerList = await headers();

    return getLocalizedMetadata(cookieStore, headerList, {
        titleKey: 'meta.auth.login.title',
        descriptionKey: 'meta.auth.login.description',
        noindex: true
    });
}
