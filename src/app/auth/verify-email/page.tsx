import React from 'react';
import { VerifyEmailTemplate } from '@/client/components';

export const dynamic = 'force-dynamic';

export default async function VerifyEmailPage({
    searchParams
}: Readonly<{
    searchParams: Promise<{ new?: string }>;
}>) {
    const searchParamsData = await searchParams;
    const newParam = searchParamsData?.new === 'false' ? false : true;

    return <VerifyEmailTemplate new={newParam} />;
}
