import React from 'react';
import { VerifyEmailChangeTemplate } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/server/utils/seo';

export const dynamic = 'force-dynamic';

//|=============================================================================================|//

export default function VerifyEmailChangePage() {
    return <VerifyEmailChangeTemplate />;
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.auth.verify-email-change.title',
        descriptionKey: 'meta.auth.verify-email-change.description',
        noindex: true
    });
}
