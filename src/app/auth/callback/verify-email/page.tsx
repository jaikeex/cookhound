'use client';

import React, { Suspense } from 'react';
import { VerifyEmailCallbackTemplate, Loader } from '@/client/components';
import dynamic from 'next/dynamic';

function VerifyEmailCallbackPage() {
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
            <VerifyEmailCallbackTemplate />
        </Suspense>
    );
}

export default dynamic(() => Promise.resolve(VerifyEmailCallbackPage), {
    ssr: false
});
