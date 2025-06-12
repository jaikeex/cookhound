import React from 'react';
import { RegisterTemplate } from '@/client/components';
import { verifyIsGuestWithRedirect } from '@/server/utils';

export default async function RegisterPage() {
    await verifyIsGuestWithRedirect();

    return <RegisterTemplate />;
}
