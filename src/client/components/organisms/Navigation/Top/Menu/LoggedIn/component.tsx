'use client';

import React from 'react';
import {
    Avatar,
    ButtonBase,
    LogoutButton,
    ThemeSwitcher,
    Typography
} from '@/client/components';
import type { UserDTO } from '@/common/types';
import { useLocale } from '@/client/store/I18nContext';
import Link from 'next/link';

type LoggedInMenuContentProps = Readonly<{
    user: UserDTO;
}>;

export const LoggedInMenuContent: React.FC<LoggedInMenuContentProps> = ({
    user
}) => {
    const { t } = useLocale();

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
                    href={`/user/${user.id}`}
                    className="flex flex-col items-center gap-4"
                >
                    <ButtonBase className="mx-auto w-52">
                        {t('app.general.my-account')}
                    </ButtonBase>
                </Link>

                <LogoutButton />
            </div>
        </React.Fragment>
    );
};
