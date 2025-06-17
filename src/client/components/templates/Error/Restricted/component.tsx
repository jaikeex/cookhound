'use client';

import { ButtonBase, LoginTemplate, Typography } from '@/client/components';
import { useLocale } from '@/client/store';
import Link from 'next/link';
import * as React from 'react';

type RestrictedTemplateProps = Readonly<{
    anonymous: boolean;
    target: string;
}>;

export const RestrictedTemplate: React.FC<RestrictedTemplateProps> = ({
    anonymous,
    target
}) => {
    const { t } = useLocale();

    return (
        <div className="flex flex-col items-center min-h-screen pt-10 text-center">
            <Typography variant="heading-lg" className="mb-4">
                You are not authorized to access this page.
            </Typography>

            {anonymous ? (
                <>
                    <Typography
                        variant="body"
                        className="mb-6 text-gray-700 dark:text-gray-300"
                    >
                        This page is for registered users only. Please login to
                        continue.
                    </Typography>
                    <LoginTemplate callbackUrl={target} />
                </>
            ) : (
                <>
                    <Typography
                        variant="body"
                        className="mb-6 text-gray-700 dark:text-gray-300"
                    >
                        Please contact the administrator if you believe this is
                        an error.
                    </Typography>
                    <Link href={'/'} className="mx-auto">
                        <ButtonBase className="mx-auto w-52" color="primary">
                            {t('app.general.home')}
                        </ButtonBase>
                    </Link>
                </>
            )}
        </div>
    );
};
