'use client';

import React, { useEffect } from 'react';

type ErrorPageProps = Readonly<{
    error: Error & { digest?: string };
}>;

export default function ErrorPage({ error }: ErrorPageProps) {
    useEffect(() => {}, [error]);

    return (
        <div>
            <h2>Something went wrong!</h2>
        </div>
    );
}
