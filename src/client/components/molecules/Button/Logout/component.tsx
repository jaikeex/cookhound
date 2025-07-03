'use client';

import React, { useCallback } from 'react';
import type { BaseButtonProps } from '@/client/components';
import { ButtonBase } from '@/client/components';
import { classNames } from '@/client/utils';
import { useRouter } from 'next/navigation';
import { useAuth, useLocale, useSnackbar } from '@/client/store';
import { chqc } from '@/client/request/queryClient';
import { useQueryClient } from '@tanstack/react-query';

type LogoutButtonProps = BaseButtonProps;

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
    const router = useRouter();
    const queryClient = useQueryClient();
    const { setUser } = useAuth();
    const { alert } = useSnackbar();
    const { t } = useLocale();

    const { mutate: logout } = chqc.auth.useLogout({
        onSuccess: () => {
            alert({
                message: t('auth.success.logout'),
                variant: 'success'
            });
            setUser(null);
            queryClient.clear();
            handleLogoutSuccess();
        }
    });

    const handleLogoutSuccess = useCallback(() => {
        router.push('/');
    }, [router]);

    const handleClick = useCallback(async () => {
        // All mutations expect a payload by definiton.
        logout(undefined);
    }, [logout]);

    return (
        <ButtonBase
            color="subtle"
            size="sm"
            icon="exit"
            onClick={handleClick}
            className={classNames('font-normal', className)}
        >
            {t('auth.form.logout')}
        </ButtonBase>
    );
};
