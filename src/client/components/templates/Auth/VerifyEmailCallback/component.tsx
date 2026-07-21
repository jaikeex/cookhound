'use client';

import React, { useEffect } from 'react';
import { ButtonBase, Loader, Typography } from '@/client/components';
import Link from 'next/link';
import { chqc, QUERY_KEYS } from '@/client/data';
import type { RequestError } from '@/client/error';
import { useQueryClient } from '@tanstack/react-query';
import type { I18nMessage } from '@/client/locales';
import { useSearchParams } from 'next/navigation';
import { ROUTES } from '@/common/constants';
import { t } from '@/client/locales';

export const VerifyEmailCallbackTemplate: React.FC = () => {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();

    const token = searchParams.get('token');
    const email = searchParams.get('email');

    const {
        mutate: verifyEmail,
        isPending,
        isSuccess,
        error
    } = chqc.user.useVerifyEmail({
        onSuccess: () => {
            queryClient.invalidateQueries({
                predicate: (query) =>
                    query.queryKey[0] === QUERY_KEYS.user.namespace ||
                    query.queryKey[0] === QUERY_KEYS.auth.namespace
            });
        }
    });

    useEffect(() => {
        if (token) {
            verifyEmail(token);
        }
    }, [token, verifyEmail]);

    const renderContent = () => {
        if (isPending) {
            return (
                <div className="flex flex-col items-center space-y-4">
                    <Loader size="lg" />
                    <Typography>
                        {t('auth.verify-email.authenticating')}
                    </Typography>
                </div>
            );
        }

        if (isSuccess) {
            return (
                <div className="flex flex-col items-center space-y-6">
                    <Typography variant="heading-md">
                        {t('auth.verify-email.success-title')}
                    </Typography>
                    <Typography>
                        {t('auth.verify-email.success-description')}
                    </Typography>
                    <Link href={ROUTES.auth.login} className="w-full">
                        <ButtonBase className="w-full">
                            {t('auth.form.continue-to-login')}
                        </ButtonBase>
                    </Link>
                </div>
            );
        }

        const errorMessage = error
            ? t((error as RequestError).message as I18nMessage)
            : t('auth.error.default');

        const encodedEmail = email ? encodeURIComponent(email) : '';

        return (
            <div className="flex flex-col items-center space-y-6">
                <Typography variant="heading-md" className="text-danger">
                    {t('auth.verify-email.error-title')}
                </Typography>
                <Typography>{errorMessage}</Typography>
                <Typography>
                    <Link
                        href={
                            email
                                ? `${ROUTES.auth.verifyEmail}?new=false&email=${encodedEmail}`
                                : `${ROUTES.auth.verifyEmail}?new=false`
                        }
                    >
                        {t('auth.verify-email.try-again')}
                    </Link>
                </Typography>
            </div>
        );
    };

    return (
        <div className="w-full max-w-md mx-auto py-8 text-center">
            {renderContent()}
        </div>
    );
};
