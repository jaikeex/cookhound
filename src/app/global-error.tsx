'use client';

import React, { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

type ErrorPageProps = Readonly<{
    error: Error & { digest?: string };
}>;

export default function ErrorPage({ error }: ErrorPageProps) {
    useEffect(() => {
        // Log the error to Sentry
        Sentry.captureException(error);
    }, [error]);

    return (
        <div>
            <h2>Something went wrong!</h2>
        </div>
    );
}
