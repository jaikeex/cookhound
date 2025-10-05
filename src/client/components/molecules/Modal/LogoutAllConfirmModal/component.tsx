'use client';

import React, { useCallback, useState } from 'react';
import type { ModalProps } from '@/client/components/molecules/Modal/types';
import { ButtonBase, Typography, PasswordInput } from '@/client/components';
import { useLocale, useSnackbar, useAuth } from '@/client/store';
import { AuthType } from '@/common/types';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { chqc } from '@/client/request/queryClient';
import { eventBus, AppEvent } from '@/client/events';

export type LogoutAllConfirmModalProps = Readonly<{
    onClose?: () => void;
}> &
    ModalProps;

export const LogoutAllConfirmModal: React.FC<LogoutAllConfirmModalProps> = ({
    onClose,
    close
}) => {
    const { t } = useLocale();
    const { alert } = useSnackbar();
    const { user, setUser } = useAuth();
    const queryClient = useQueryClient();
    const router = useRouter();

    const [password, setPassword] = useState('');

    const { mutateAsync: logoutEverywhere, isPending } = chqc.auth.useLogoutAll(
        {
            onSuccess: () => {
                setUser(null);
                queryClient.resetQueries();

                alert({
                    variant: 'success',
                    message: t('auth.logout-all.success')
                });

                eventBus.emit(AppEvent.USER_LOGGED_OUT, undefined);
                router.push('/');
            }
        }
    );

    const handleCancel = useCallback(() => {
        onClose?.();
        close?.();
    }, [onClose, close]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setPassword(e.target.value);
        },
        []
    );

    const handleConfirm = useCallback(async () => {
        await logoutEverywhere(undefined);
    }, [logoutEverywhere]);

    const needsPassword = user?.authType === AuthType.Local;

    return (
        <div className="flex flex-col w-full h-full max-h-[85dvh] md:max-h-[70dvh] max-w-[80dvw] md:max-w-[40dvw] xl:max-w-[30dvw] px-4">
            <Typography variant="heading-sm">
                {t('auth.logout-all.title')}
            </Typography>
            <Typography className="mt-2">
                {/* eslint-disable-next-line react/no-danger */}
                {t('auth.logout-all.body')}
            </Typography>

            {needsPassword ? (
                <PasswordInput
                    className="mt-6"
                    id="logout-all-password"
                    name="logout-all-password"
                    label={t('auth.logout-all.password')}
                    disabled={isPending}
                    onChange={handleInputChange}
                    autoComplete="current-password"
                />
            ) : null}

            <div className="flex-shrink-0 flex w-full gap-3 mt-6 pt-4">
                <ButtonBase
                    onClick={handleCancel}
                    color="subtle"
                    outlined
                    size="md"
                    className="w-full"
                    disabled={isPending}
                >
                    {t('app.general.cancel')}
                </ButtonBase>

                <ButtonBase
                    color="danger"
                    onClick={handleConfirm}
                    size="md"
                    className="w-full"
                    disabled={isPending || (needsPassword && !password)}
                >
                    {t('auth.logout-all.confirm')}
                </ButtonBase>
            </div>
        </div>
    );
};
