import React from 'react';
import { SendResetPasswordEmailTemplate } from '@/client/components';
import { verifyIsGuestWithRedirect } from '@/server/utils';

export default async function ResetPasswordPage() {
    await verifyIsGuestWithRedirect();

    return <SendResetPasswordEmailTemplate />;
}
