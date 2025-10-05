'use client';

import React from 'react';
import { ButtonBase, type BaseButtonProps } from '@/client/components';
import { classNames } from '@/client/utils';
import { useLogout } from '@/client/hooks';
import { useLocale } from '@/client/store';

type LogoutButtonProps = BaseButtonProps;

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
    const { t } = useLocale();

    const { logout: handleClick, isPending } = useLogout();

    return (
        <ButtonBase
            color="subtle"
            size="sm"
            icon="exit"
            onClick={handleClick}
            disabled={isPending}
            className={classNames('font-normal', className)}
        >
            {t('auth.form.logout')}
        </ButtonBase>
    );
};
