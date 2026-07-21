'use client';

import React, { useMemo } from 'react';
import type { User } from '@/common/types';
import {
    Avatar,
    AvatarInput,
    Divider,
    Time,
    Typography
} from '@/client/components';
import { t } from '@/client/locales';
import { getAgeString } from '@/client/utils';

export type ProfileHeadPropsMobile = Readonly<{
    user: User;
    isCurrentUser: boolean;
}>;

export const ProfileHeadMobile: React.FC<ProfileHeadPropsMobile> = ({
    user,
    isCurrentUser
}) => {
    const accountAge = useMemo(
        () => getAgeString(user.createdAt),
        [user.createdAt]
    );

    return (
        <div className="flex flex-col items-center gap-2">
            {isCurrentUser ? (
                <AvatarInput />
            ) : (
                <Avatar src={user.avatarUrl ?? 'default'} size="xxxl" />
            )}

            <Typography as="h1" variant="heading-md">
                {user.username}
            </Typography>

            {isCurrentUser ? (
                <React.Fragment>
                    <Typography variant="body-sm">{user.email}</Typography>

                    <Divider />

                    <div className="flex items-center justify-center gap-2">
                        <div className="flex flex-col items-center justify-center">
                            <Typography variant="body-sm">
                                {t('app.profile.account-age')}:
                            </Typography>

                            <Typography variant="body-sm">
                                <Time dateTime={user.createdAt}>
                                    {accountAge}
                                </Time>
                            </Typography>
                        </div>
                    </div>
                </React.Fragment>
            ) : null}
        </div>
    );
};
