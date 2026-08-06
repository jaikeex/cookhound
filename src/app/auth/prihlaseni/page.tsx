import React from 'react';
import { LoginTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/server/utils/seo';

//|=============================================================================================|//

export default function LoginPage() {
    return <LoginTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.auth.login.title',
        descriptionKey: 'meta.auth.login.description',
        noindex: true
    });
}
