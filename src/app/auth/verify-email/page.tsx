import React from 'react';
import { VerifyEmailTemplate } from '@/client/components';
import { verifyIsGuestWithRedirect } from '@/server/utils';

const VerifyEmailNotificationPage: React.FC = async () => {
    await verifyIsGuestWithRedirect();

    return <VerifyEmailTemplate />;
};

export default VerifyEmailNotificationPage;
