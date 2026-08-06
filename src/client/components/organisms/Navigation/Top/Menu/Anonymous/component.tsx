import React from 'react';
import { Avatar } from '@/client/components/atoms/Avatar';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { ThemeSwitcher } from '@/client/components/molecules/ThemeSwitcher';
import { Typography } from '@/client/components/atoms/Typography';
import Link from 'next/link';
import { ROUTES } from '@/common/constants';
import { t } from '@/client/locales';

export const AnonymousMenuContent: React.FC = () => {
    return (
        <React.Fragment>
            <Avatar src="anonymous" size="xxl" className="mx-auto" />

            <Typography variant="body-sm" className="text-center mt-4">
                {t('app.general.anonymous')}
            </Typography>

            <div className="flex flex-col items-center gap-6 mt-8">
                {/*<ButtonBase className="mx-auto w-52">Change Avatar</ButtonBase>*/}
                <ThemeSwitcher stretch />
                <Link href={ROUTES.auth.login} tabIndex={-1}>
                    <ButtonBase
                        className="mx-auto w-52"
                        color="primary"
                        aria-label={t('auth.form.login')}
                    >
                        {t('auth.form.login')}
                    </ButtonBase>
                </Link>
                <Link
                    href={ROUTES.auth.register}
                    className="mx-auto"
                    tabIndex={-1}
                >
                    <ButtonBase
                        className="mx-auto w-52"
                        color="primary"
                        aria-label={t('auth.form.register')}
                    >
                        {t('auth.form.register')}
                    </ButtonBase>
                </Link>
            </div>
        </React.Fragment>
    );
};
