'use client';

import { ButtonBase, Typography } from '@/client/components';
import { useLocale } from '@/client/store';
import Link from 'next/link';
import * as React from 'react';

type NotFoundTemplateProps = Readonly<NonNullable<unknown>>;

export const NotFoundTemplate: React.FC<NotFoundTemplateProps> = () => {
    const { t } = useLocale();

    return (
        <div className="flex flex-col items-center min-h-screen pt-10 text-center">
            <Typography variant="heading-lg" className="mb-4">
                Page not found
            </Typography>
            <Typography
                variant="body"
                className="mb-6 text-gray-700 dark:text-gray-300"
            >
                The content you are looking for does not exist.
            </Typography>
            <Link href={'/'} className="mx-auto">
                <ButtonBase className="mx-auto w-52" color="primary">
                    {t('app.general.home')}
                </ButtonBase>
            </Link>
        </div>
    );
};
