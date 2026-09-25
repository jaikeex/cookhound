'use client';

import React, { useEffect } from 'react';
import { Loader } from '@/client/components/atoms/Loader';
import { Typography } from '@/client/components/atoms/Typography';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { chqc, QUERY_KEYS } from '@/client/data';
import { useQueryClient } from '@tanstack/react-query';
import type { I18nMessage } from '@/client/locales';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ROUTES } from '@/common/constants';
import { t } from '@/client/locales';

export const VerifyEmailChangeTemplate: React.FC = () => {
    const queryClient = useQueryClient();
    const searchParams = useSearchParams();

    const token = searchParams.get('token');

    const {
        mutate: confirmEmailChange,
        isIdle,
        isPending,
        isSuccess,
        error
    } = chqc.user.useConfirmEmailChange({
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
            confirmEmailChange(token);
        }
    }, [token, confirmEmailChange]);

    const renderContent = () => {
        if (isPending || (token && isIdle)) {
            return (
                <div className="flex flex-col items-center space-y-4">
                    <Loader size="lg" />
                    <Typography>
                        {t('auth.verify-email-change.pending')}
                    </Typography>
                </div>
            );
        }

        if (isSuccess) {
            return (
                <div className="flex flex-col items-center space-y-6">
                    <Typography variant="heading-md">
                        {t('auth.verify-email-change.success-title')}
                    </Typography>
                    <Typography>
                        {t('auth.verify-email-change.success-description')}
                    </Typography>
                    <Link href={ROUTES.auth.login} className="w-full">
                        <ButtonBase className="w-full">
                            {t('auth.verify-email-change.continue')}
                        </ButtonBase>
                    </Link>
                </div>
            );
        }

        const errorMessage = error
            ? t(error.message as I18nMessage, undefined, 'auth.error.default')
            : t('auth.error.default');

        return (
            <div className="flex flex-col items-center space-y-6">
                <Typography variant="heading-md" className="text-danger">
                    {t('auth.verify-email-change.error-title')}
                </Typography>
                <Typography>{errorMessage}</Typography>
            </div>
        );
    };

    return (
        <div className="w-full max-w-md mx-auto py-8 text-center">
            {renderContent()}
        </div>
    );
};
