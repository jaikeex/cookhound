import React from 'react';
import type { UserDTO } from '@/common/types';
import { Typography } from '@/client/components';
import Link from 'next/link';
import { useLocale } from '@/client/store';

export type ProfileBodyInfoProps = Readonly<{
    user: UserDTO;
}>;

export const ProfileBodyInfo: React.FC<ProfileBodyInfoProps> = ({ user }) => {
    const { t } = useLocale();

    return (
        <div className="space-y-4">
            <Typography variant="heading-md">{user.username}</Typography>

            <Typography variant="body-sm" className="self-start">
                <Link href={'/auth/reset-password?email=' + user.email}>
                    {t('auth.form.reset-password')}
                </Link>
            </Typography>
        </div>
    );
};
