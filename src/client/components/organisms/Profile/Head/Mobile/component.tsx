import React, { useMemo } from 'react';
import type { UserDTO } from '@/common/types';
import { Avatar, Divider, Typography } from '@/client/components';
import { useLocale } from '@/client/store';
import { getAgeString } from '@/client/utils';

export type ProfileHeadPropsMobile = Readonly<{
    user: UserDTO;
    isCurrentUser: boolean;
}>;

export const ProfileHeadMobile: React.FC<ProfileHeadPropsMobile> = ({
    user,
    isCurrentUser
}) => {
    const { t, locale } = useLocale();

    const accountAge = useMemo(
        () => getAgeString(user.createdAt, locale),
        [user.createdAt, locale]
    );

    return (
        <div className="flex flex-col items-center gap-2">
            <Avatar src={user.avatarUrl || 'default'} size="xl" />

            <Typography variant="heading-md">{user.username}</Typography>

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
                                {accountAge}
                            </Typography>
                        </div>
                    </div>
                </React.Fragment>
            ) : null}
        </div>
    );
};
