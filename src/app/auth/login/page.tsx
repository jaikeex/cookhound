'use client';

import React from 'react';
import { LoginTemplate } from '@/client/components';
import dynamic from 'next/dynamic';

function LoginPage() {
    return <LoginTemplate />;
}

export default dynamic(() => Promise.resolve(LoginPage), {
    ssr: false
});
