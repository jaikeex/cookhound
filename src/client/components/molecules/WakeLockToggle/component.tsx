'use client';

import React, { useCallback } from 'react';
import { IconButton } from '@/client/components/atoms/Button/Icon';
import { useWakeLock } from '@/client/hooks';
import { t } from '@/client/locales';
import { useSnackbar } from '@/client/store';
import { classNames } from '@/client/utils';

export type WakeLockToggleProps = Readonly<{
    className?: string;
}>;

export const WakeLockToggle: React.FC<WakeLockToggleProps> = ({
    className
}) => {
    const { isActive, isSupported, toggle } = useWakeLock();
    const { alert } = useSnackbar();

    const handleClick = useCallback(() => {
        const wasActive = isActive;

        void toggle().then((nowActive) => {
            if (nowActive) {
                alert({
                    message: t('app.recipe.keep-screen-on-active'),
                    variant: 'success'
                });
                return;
            }

            // Switching off cannot fail; a false result after an attempt to
            // switch on means the browser refused the lock.
            alert(
                wasActive
                    ? {
                          message: t('app.recipe.keep-screen-on-inactive'),
                          variant: 'info'
                      }
                    : {
                          message: t('app.recipe.keep-screen-on-error'),
                          variant: 'error'
                      }
            );
        });
    }, [alert, isActive, toggle]);

    if (!isSupported) {
        return null;
    }

    return (
        <IconButton
            icon={'lightbulb'}
            size={22}
            onClick={handleClick}
            aria-pressed={isActive}
            aria-label={t('app.recipe.keep-screen-on')}
            className={classNames(
                'flex items-center justify-center size-10 rounded',
                className
            )}
            iconClassName={
                isActive
                    ? 'text-warning-500'
                    : 'text-gray-800 dark:text-gray-200'
            }
        />
    );
};
