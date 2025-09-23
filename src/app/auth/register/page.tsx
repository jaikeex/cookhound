'use client';

import React from 'react';
import { RegisterTemplate } from '@/client/components';
import dynamic from 'next/dynamic';

function RegisterPage() {
    return <RegisterTemplate />;
}

export default dynamic(() => Promise.resolve(RegisterPage), {
    ssr: false
});
