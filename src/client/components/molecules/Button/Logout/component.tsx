'use client';

import React, { useCallback } from 'react';
import type { BaseButtonProps } from '@/client/components';
import { ButtonBase } from '@/client/components';
import classnames from 'classnames';
import { useRouter } from 'next/navigation';
import { authService } from '@/client/services';
import { useAuth, useLocale, useSnackbar } from '@/client/store';

type LogoutButtonProps = BaseButtonProps;

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
    const router = useRouter();
    const { setUser } = useAuth();
    const { alert } = useSnackbar();
    const { t } = useLocale();

    const handleClick = useCallback(async () => {
        await authService.logout();
        setUser(null);
        alert({
            message: t('auth.success.logout'),
            variant: 'success'
        });

        router.push('/');
    }, [alert, router, setUser, t]);

    return (
        <ButtonBase
            color="subtle"
            size="sm"
            icon="exit"
            onClick={handleClick}
            className={classnames('font-normal', className)}
        >
            {t('auth.form.logout')}
        </ButtonBase>
    );
};
