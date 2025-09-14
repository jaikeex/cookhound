'use client';

import React, { useMemo } from 'react';
import type { UserDTO } from '@/common/types';
import { Avatar, AvatarInput, Typography } from '@/client/components';
import { useLocale } from '@/client/store';
import { getAgeString } from '@/client/utils';

export type ProfileHeadPropsDesktop = Readonly<{
    user: UserDTO;
    isCurrentUser: boolean;
}>;

export const ProfileHeadDesktop: React.FC<ProfileHeadPropsDesktop> = ({
    user,
    isCurrentUser
}) => {
    const { t, locale } = useLocale();

    const accountAge = useMemo(
        () => getAgeString(user.createdAt, locale),
        [user.createdAt, locale]
    );

    return (
        <div>
            <div className="flex items-center gap-10 h-36 w-full">
                {isCurrentUser ? (
                    <AvatarInput className="h-36 w-36 max-w-36 max-h-36" />
                ) : (
                    <Avatar src={user.avatarUrl ?? 'default'} size="xxxl" />
                )}

                <div className="flex flex-col gap-2 h-32 text-right">
                    <Typography variant="heading-md">
                        {user.username}
                    </Typography>

                    {isCurrentUser ? (
                        <React.Fragment>
                            <Typography variant="body-sm">
                                {user.email}
                            </Typography>

                            <Typography variant="body-sm" className="mt-auto">
                                {t('app.profile.account-age')}:&nbsp;
                                {accountAge}
                            </Typography>
                        </React.Fragment>
                    ) : null}
                </div>
            </div>
        </div>
    );
};
