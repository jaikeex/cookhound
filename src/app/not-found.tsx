import { NotFoundTemplate } from '@/client/components';
import React, { Suspense } from 'react';

export default function NotFoundPage() {
    return (
        <Suspense fallback={null}>
            <NotFoundTemplate />
        </Suspense>
    );
}
