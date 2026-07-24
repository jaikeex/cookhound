'use client';

import React from 'react';
import {
    ButtonBase,
    type BaseButtonProps
} from '@/client/components/atoms/Button/Base';
import { classNames } from '@/client/utils';
import { useLogout } from '@/client/hooks';
import { t } from '@/client/locales';

type LogoutButtonProps = BaseButtonProps;

export const LogoutButton: React.FC<LogoutButtonProps> = ({ className }) => {
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
