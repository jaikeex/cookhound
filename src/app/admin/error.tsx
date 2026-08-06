'use client';

import React from 'react';
import { ErrorBoundaryTemplate } from '@/client/components/templates/Error/Boundary';

type ErrorBoundaryProps = Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>;

export default function AdminError({ error, reset }: ErrorBoundaryProps) {
    return (
        <ErrorBoundaryTemplate
            error={error}
            reset={reset}
            descriptionKey="app.error.boundary.admin.description"
        />
    );
}
