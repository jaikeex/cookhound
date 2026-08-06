import React from 'react';
import { RegisterTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/server/utils/seo';

//|=============================================================================================|//

export default function RegisterPage() {
    return <RegisterTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.auth.register.title',
        descriptionKey: 'meta.auth.register.description',
        noindex: true
    });
}
