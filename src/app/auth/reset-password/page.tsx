import React from 'react';
import { SendResetPasswordEmailTemplate } from '@/client/components';

export const dynamic = 'force-dynamic';

type ResetPasswordPageParams = {
    readonly searchParams: Promise<{ email: string }>;
};

export default async function Page({ searchParams }: ResetPasswordPageParams) {
    const searchParamsResolved = await searchParams;

    return (
        <SendResetPasswordEmailTemplate email={searchParamsResolved.email} />
    );
}
