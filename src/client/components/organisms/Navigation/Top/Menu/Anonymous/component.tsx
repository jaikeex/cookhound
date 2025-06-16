'use client';

import React from 'react';
import {
    Avatar,
    ButtonBase,
    ThemeSwitcher,
    Typography
} from '@/client/components';
import Link from 'next/link';
import { useLocale } from '@/client/store';

export const AnonymousMenuContent: React.FC = () => {
    const { t } = useLocale();

    return (
        <React.Fragment>
            <Avatar src="anonymous" size="xxl" className="mx-auto" />

            <Typography variant="body-sm" className="text-center mt-4">
                {t('app.general.anonymous')}
            </Typography>

            <div className="flex flex-col items-center gap-6 mt-8">
                {/*<ButtonBase className="mx-auto w-52">Change Avatar</ButtonBase>*/}
                <ThemeSwitcher stretch />
                <Link href={'/auth/login'}>
                    <ButtonBase className="mx-auto w-52" color="primary">
                        {t('auth.form.login')}
                    </ButtonBase>
                </Link>
                <Link href={'/auth/register'} className="mx-auto">
                    <ButtonBase className="mx-auto w-52" color="primary">
                        {t('auth.form.register')}
                    </ButtonBase>
                </Link>
            </div>
        </React.Fragment>
    );
};
