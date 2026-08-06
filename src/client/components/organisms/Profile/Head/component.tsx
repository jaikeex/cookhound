'use client';

import React, { useMemo } from 'react';
import type { User } from '@/common/types';
import { Avatar } from '@/client/components/atoms/Avatar';
import { AvatarInput } from '@/client/components/molecules/Form/AvatarInput';
import { Divider } from '@/client/components/atoms/Divider';
import { Time } from '@/client/components/atoms/Time';
import { Typography } from '@/client/components/atoms/Typography';
import { t } from '@/client/locales';
import { getAgeString } from '@/client/utils';

export type ProfileHeadProps = Readonly<{
    isCurrentUser: boolean;
    user: User;
}>;

export const ProfileHead: React.FC<ProfileHeadProps> = ({
    isCurrentUser,
    user
}) => {
    const accountAge = useMemo(
        () => getAgeString(user.createdAt),
        [user.createdAt]
    );

    return (
        <div className="flex flex-col items-center gap-2 md:grid md:grid-cols-4 md:gap-12 md:h-36 md:w-full">
            {isCurrentUser ? (
                <AvatarInput className="md:col-span-1 md:h-36 md:w-36 md:max-h-36 md:max-w-36" />
            ) : (
                <Avatar
                    size="xxxl"
                    src={user.avatarUrl ?? 'default'}
                    className="md:col-span-1"
                />
            )}

            <div className="contents md:col-span-3 md:flex md:h-32 md:flex-col md:gap-2">
                <Typography as="h1" variant="heading-md">
                    {user.username}
                </Typography>

                {isCurrentUser ? (
                    <React.Fragment>
                        <Typography variant="body-sm">{user.email}</Typography>

                        <Divider className="md:hidden" />

                        <Typography
                            variant="body-sm"
                            className="flex flex-col items-center md:mt-auto md:flex-row"
                        >
                            <span>{t('app.profile.account-age')}:&nbsp;</span>
                            <Time dateTime={user.createdAt}>{accountAge}</Time>
                        </Typography>
                    </React.Fragment>
                ) : null}
            </div>
        </div>
    );
};
