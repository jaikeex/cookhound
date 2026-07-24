'use client';

import React from 'react';
import { Avatar } from '@/client/components/atoms/Avatar';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { LogoutButton } from '@/client/components/molecules/Button/Logout';
import { ThemeSwitcher } from '@/client/components/molecules/ThemeSwitcher';
import { Typography } from '@/client/components/atoms/Typography';
import { UserRole, type User } from '@/common/types';
import Link from 'next/link';
import { ROUTES } from '@/common/constants';
import { t } from '@/client/locales';

type LoggedInMenuContentProps = Readonly<{
    user: User;
}>;

export const LoggedInMenuContent: React.FC<LoggedInMenuContentProps> = ({
    user
}) => {
    return (
        <React.Fragment>
            <Avatar
                src={user.avatarUrl || 'default'}
                size="xxl"
                className="mx-auto"
            />

            <Typography variant="body-sm" className="mt-4 text-center">
                {user.username}
            </Typography>

            <div className="flex flex-col items-center h-full gap-6 mt-8">
                <ThemeSwitcher stretch />

                <Link
                    href={ROUTES.user.detail(user.id)}
                    className="flex flex-col items-center gap-4"
                    tabIndex={-1}
                >
                    <ButtonBase
                        className="mx-auto w-52"
                        aria-label={t('app.general.my-account')}
                    >
                        {t('app.general.my-account')}
                    </ButtonBase>
                </Link>

                {user.role === UserRole.Admin ? (
                    <Link
                        href={ROUTES.admin.root}
                        className="flex flex-col items-center gap-4"
                        tabIndex={-1}
                    >
                        <ButtonBase
                            className="mx-auto w-52"
                            aria-label={t('admin.title')}
                        >
                            {t('admin.title')}
                        </ButtonBase>
                    </Link>
                ) : null}

                <LogoutButton />
            </div>
        </React.Fragment>
    );
};
