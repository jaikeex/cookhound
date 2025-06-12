import React from 'react';
import { LoginTemplate } from '@/client/components';
import { verifyIsGuestWithRedirect } from '@/server/utils';

export default async function LoginPage() {
    await verifyIsGuestWithRedirect();

    return <LoginTemplate />;
}
