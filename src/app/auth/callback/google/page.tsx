'use client';

import React, { useEffect } from 'react';
import { ENV_CONFIG } from '@/client/constants';

export default function GoogleCallback() {
    useEffect(() => {
        const data = {
            authCode: new URLSearchParams(window.location.search).get('code')
        };

        window.opener.postMessage(data, ENV_CONFIG.ORIGIN);
        window.close();
    }, []);

    return (
        <div>
            <h1>Authenticating...</h1>
            {/* Optionally display a loading spinner here */}
        </div>
    );
}
