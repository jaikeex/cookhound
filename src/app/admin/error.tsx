'use client';

import React from 'react';
import { ErrorBoundaryTemplate } from '@/client/components/templates/Error/Boundary';

type ErrorBoundaryProps = Readonly<{
    error: Error & { digest?: string };
    retry: () => void;
}>;

export default function AdminError({ error, retry }: ErrorBoundaryProps) {
    return (
        <ErrorBoundaryTemplate
            error={error}
            retry={retry}
            descriptionKey="app.error.boundary.admin.description"
        />
    );
}
