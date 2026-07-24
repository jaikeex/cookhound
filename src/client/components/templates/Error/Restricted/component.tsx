'use client';

import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { LoginTemplate } from '@/client/components/templates/Auth/Login';
import { Typography } from '@/client/components/atoms/Typography';
import Link from 'next/link';
import * as React from 'react';
import { t } from '@/client/locales';

type RestrictedTemplateProps = Readonly<{
    anonymous: boolean;
    target: string;
}>;

export const RestrictedTemplate: React.FC<RestrictedTemplateProps> = ({
    anonymous,
    target
}) => {
    return (
        <div className="flex flex-col items-center pt-10 text-center">
            <Typography as="h1" variant="heading-lg" className="mb-4">
                {t('app.error.restricted')}
            </Typography>

            {anonymous ? (
                <>
                    <Typography
                        variant="body"
                        className="mb-6 text-gray-700 dark:text-gray-300"
                    >
                        {t('app.error.restricted.description')}
                    </Typography>
                    <LoginTemplate callbackUrl={target} />
                </>
            ) : (
                <>
                    <Typography
                        variant="body"
                        className="mb-6 text-gray-700 dark:text-gray-300"
                    >
                        {t('app.error.restricted.contact-admin')}
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
