'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '@/client/request';

export default function VerifyEmailCallback() {
    const [result, setResult] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const verifyEmail = async () => {
        const data = {
            token: new URLSearchParams(window.location.search).get('token')
        };

        if (!data.token) {
            return;
        }

        try {
            await apiClient.user.verifyEmail(data.token);
            setResult(true);
        } catch (error: unknown) {
            setError(error instanceof Error ? error.message : 'unknown error');
        }
    };

    useEffect(() => {
        verifyEmail();
    }, []);

    return (
        <div>
            <h1>Authenticating...</h1>
            {result && <h2>Email verified successfully!</h2>}
            {error && <h2>{error}</h2>}
        </div>
    );
}
