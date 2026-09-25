'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { Logo } from '@/client/components/atoms/Logo';
import { Typography } from '@/client/components/atoms/Typography';
import { t } from '@/client/locales';
import type { I18nMessage } from '@/client/locales';
import { RequestError, reportClientError } from '@/client/error';
import type { ClientErrorSource } from '@/common/constants';

export type ErrorBoundaryTemplateProps = Readonly<{
    error: Error & { digest?: string };
    retry: () => void;
    titleKey?: I18nMessage;
    descriptionKey?: I18nMessage;
    source?: Extract<ClientErrorSource, 'boundary' | 'global-error'>;
    withLogo?: boolean;
}>;

export const ErrorBoundaryTemplate: React.FC<ErrorBoundaryTemplateProps> = ({
    error,
    retry,
    titleKey = 'app.error.boundary',
    descriptionKey = 'app.error.boundary.description',
    source = 'boundary',
    withLogo = false
}) => {
    useEffect(() => {
        console.error(`[${source}]`, error.digest, error);

        if (!error.digest) {
            reportClientError(error, source);
        }
    }, [error, source]);

    const reference =
        error.digest ??
        (error instanceof RequestError && error.requestId !== 'unknown'
            ? error.requestId
            : undefined);

    return (
        <div className="flex flex-col items-center pt-10 text-center">
            {withLogo && <Logo className="logo-md mb-8" />}

            <Typography as="h1" variant="heading-lg" className="mb-4">
                {t(titleKey)}
            </Typography>

            <Typography
                variant="body"
                className="mb-6 text-gray-700 dark:text-gray-300"
            >
                {t(descriptionKey)}
            </Typography>

            <div className="flex flex-col items-center gap-3">
                <ButtonBase className="w-52" color="primary" onClick={retry}>
                    {t('app.error.retry')}
                </ButtonBase>

                <Link href={'/'}>
                    <ButtonBase className="w-52" color="subtle" outlined>
                        {t('app.general.home')}
                    </ButtonBase>
                </Link>
            </div>

            {reference && (
                <Typography
                    variant="body-sm"
                    className="mt-8 text-gray-500 dark:text-gray-400"
                >
                    {t('app.error.reference', { digest: reference })}
                </Typography>
            )}
        </div>
    );
};
