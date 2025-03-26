'use client';

import React, { useCallback } from 'react';
import { userService } from '@/client/services';
import { ButtonWithCooldown, Typography } from '@/client/components';

export const VerifyEmailTemplate: React.FC = () => {
    const [error, setError] = React.useState<string | null>(null);

    const resendVerificationEmail = useCallback(async () => {
        const email = new URLSearchParams(window.location.search).get('email');

        try {
            if (!email) return;
            await userService.resendVerificationEmail(email);
        } catch (error: any) {
            setError(error.message);
        }
    }, []);

    return (
        <div className="w-full max-w-md mx-auto text-center space-y-8 flex items-center flex-col">
            <Typography>
                Thank you for registering! We&apos;ve sent a verification email
                to the address you provided. Please check your email and click
                on the verification link to activate your account.
            </Typography>

            <Typography>
                If you haven&apos;t received the email, please check your spam
                folder. You can also click the button below to resend the email.
            </Typography>

            <ButtonWithCooldown
                cooldown={60000}
                onClick={resendVerificationEmail}
            >
                Resend Email
            </ButtonWithCooldown>

            {error && <p>{error}</p>}
        </div>
    );
};
