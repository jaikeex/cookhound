import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { Typography } from '@/client/components/atoms/Typography';
import Link from 'next/link';
import * as React from 'react';
import { t } from '@/client/locales';

type TooManyRequestsTemplateProps = Readonly<NonNullable<unknown>>;

export const TooManyRequestsTemplate: React.FC<
    TooManyRequestsTemplateProps
> = () => {
    return (
        <div className="flex flex-col items-center pt-10 text-center">
            <Typography as="h1" variant="heading-lg" className="mb-4">
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
