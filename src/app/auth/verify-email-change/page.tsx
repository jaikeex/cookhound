import React, { Suspense } from 'react';
import { VerifyEmailChangeTemplate, Loader } from '@/client/components';
import type { Metadata } from 'next';
import { buildLocalizedMetadata } from '@/server/utils/seo';

//|=============================================================================================|//

// The template reads the confirmation token with useSearchParams, so it needs a
// Suspense boundary for this page to prerender as a static shell.
export default function VerifyEmailChangePage() {
    return (
        <Suspense
            fallback={
                <div className="w-full max-w-md mx-auto py-8 text-center">
                    <div className="flex flex-col items-center space-y-4">
                        <Loader size="lg" />
                    </div>
                </div>
            }
        >
            <VerifyEmailChangeTemplate />
        </Suspense>
    );
}

//|=============================================================================================|//

export async function generateMetadata(): Promise<Metadata> {
    return buildLocalizedMetadata({
        titleKey: 'meta.auth.verify-email-change.title',
        descriptionKey: 'meta.auth.verify-email-change.description',
        noindex: true
    });
}
