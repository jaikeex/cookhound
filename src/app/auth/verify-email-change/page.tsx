'use client';

import React from 'react';
import { VerifyEmailChangeTemplate } from '@/client/components';
import dynamic from 'next/dynamic';

function VerifyEmailChangePage() {
    return <VerifyEmailChangeTemplate />;
}

export default dynamic(() => Promise.resolve(VerifyEmailChangePage), {
    ssr: false
});
