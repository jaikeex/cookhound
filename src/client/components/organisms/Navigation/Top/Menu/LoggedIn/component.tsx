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

type LoggedInMenuContentProps = Readonly<{
    user: UserDTO;
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

                <div className="flex flex-col items-center gap-4">
                    <ButtonBase className="mx-auto w-52">
                        Change Avatar
                    </ButtonBase>
                </div>

                <LogoutButton />
            </div>
        </React.Fragment>
    );
};
