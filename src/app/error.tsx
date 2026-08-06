'use client';

import React from 'react';
import { ErrorBoundaryTemplate } from '@/client/components/templates/Error/Boundary';

type ErrorBoundaryProps = Readonly<{
    error: Error & { digest?: string };
    reset: () => void;
}>;

export default function RootError({ error, reset }: ErrorBoundaryProps) {
    return <ErrorBoundaryTemplate error={error} reset={reset} />;
}
