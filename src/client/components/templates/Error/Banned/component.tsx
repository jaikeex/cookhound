'use client';

import * as React from 'react';
import { ButtonBase, Typography } from '@/client/components';
import { useLocale } from '@/client/store';
import Link from 'next/link';

export const BannedTemplate: React.FC = () => {
    const { t } = useLocale();

    return (
        <div className="flex flex-col items-center pt-10 text-center">
            <Typography variant="heading-lg" className="mb-4">
                {t('app.error.banned')}
            </Typography>

            <Typography
                variant="body"
                className="mb-6 text-gray-700 dark:text-gray-300"
            >
                {t('app.error.banned.description')}
            </Typography>

            <Link href={'/'} className="mx-auto">
                <ButtonBase className="mx-auto w-52" color="primary">
                    {t('app.general.home')}
                </ButtonBase>
            </Link>
        </div>
    );
};
