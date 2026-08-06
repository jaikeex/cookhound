import React, { Suspense } from 'react';
import { VerifyEmailCallbackTemplate, Loader } from '@/client/components';

export default function VerifyEmailCallbackPage() {
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
