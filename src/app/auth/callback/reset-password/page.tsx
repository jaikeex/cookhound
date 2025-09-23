'use client';

import React from 'react';
import { ResetPasswordTemplate } from '@/client/components';
import dynamic from 'next/dynamic';

function ResetPasswordCallbackPage() {
    return <ResetPasswordTemplate />;
}

export default dynamic(() => Promise.resolve(ResetPasswordCallbackPage), {
    ssr: false
});
