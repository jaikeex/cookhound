'use client';

import { ButtonBase, Typography } from '@/client/components';
import { useLocale } from '@/client/store';
import Link from 'next/link';
import * as React from 'react';

type TooManyRequestsTemplateProps = Readonly<NonNullable<unknown>>;

export const TooManyRequestsTemplate: React.FC<
    TooManyRequestsTemplateProps
> = () => {
    const { t } = useLocale();

    return (
        <div className="flex flex-col items-center min-h-screen pt-10 text-center">
            <Typography variant="heading-lg" className="mb-4">
                {t('app.error.too-many-requests')}
            </Typography>
            <Typography
                variant="body"
                className="mb-6 text-gray-700 dark:text-gray-300"
            >
                {t('app.error.too-many-requests.description')}
            </Typography>
            <Link href={'/'} className="mx-auto">
                <ButtonBase className="mx-auto w-52" color="primary">
                    {t('app.general.home')}
                </ButtonBase>
            </Link>
        </div>
    );
};
