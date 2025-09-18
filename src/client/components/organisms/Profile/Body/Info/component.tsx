'use client';

import React, { useCallback } from 'react';
import { AuthType, type UserDTO } from '@/common/types';
import {
    ButtonBase,
    Divider,
    LinkRow,
    TextInputRow,
    Typography
} from '@/client/components';
import { useLocale, useSnackbar } from '@/client/store';
import { useModal } from '@/client/store';
import { ConsentSettingsModal } from '@/client/components';
import { LogoutAllConfirmModal } from '@/client/components';
import { chqc, QUERY_KEYS } from '@/client/request/queryClient';
import { useQueryClient } from '@tanstack/react-query';

export type ProfileBodyInfoProps = Readonly<{
    user: UserDTO;
}>;

export const ProfileBodyInfo: React.FC<ProfileBodyInfoProps> = ({ user }) => {
    const { t } = useLocale();
    const { alert } = useSnackbar();
    const queryClient = useQueryClient();
    const { openModal } = useModal();

    const { mutateAsync: updateUserById, isPending } =
        chqc.user.useUpdateUserById({
            onSuccess: () => {
                queryClient.invalidateQueries({
                    predicate: (query) =>
                        query.queryKey[0] === QUERY_KEYS.auth.namespace ||
                        query.queryKey[0] === QUERY_KEYS.user.namespace
                });
            }
        });

    const handleUsernameChange = useCallback(
        async (value: string) => {
            await updateUserById(
                { userId: user.id, data: { username: value } },
                {
                    onSuccess: () => {
                        alert({
                            variant: 'success',
                            message: t('auth.form.username-changed')
                        });
                    }
                }
            );
        },
        [updateUserById, user.id, alert, t]
    );

    const handleCookieSettings = useCallback(
        () =>
            openModal((close) => <ConsentSettingsModal onClose={close} />, {
                hideCloseButton: true
            }),
        [openModal]
    );

    const handleLogoutAll = useCallback(
        () => openModal((close) => <LogoutAllConfirmModal close={close} />),
        [openModal]
    );

    return (
        <div className="space-y-4">
            <section>
                <Typography variant="heading-sm">
                    {t('app.profile.settings.section-credentials')}
                </Typography>

                <Divider className="mt-1" />

                <TextInputRow
                    className="mt-3"
                    heading={t('app.profile.settings.username')}
                    defaultValue={user.username}
                    isPending={isPending}
                    onSave={handleUsernameChange}
                    name="username"
                    inputId="username"
                />

                <Divider subtle className="mt-3" />

                {user.authType === AuthType.Local ? (
                    <React.Fragment>
                        <LinkRow
                            className="mt-3"
                            heading={t('app.profile.settings.password')}
                            href={'/auth/reset-password?email=' + user.email}
                            linkText={t('app.profile.settings.password-link')}
                        />

                        <LinkRow
                            className="mt-3"
                            heading={t('app.profile.settings.email')}
                            href={'/user/change-email'}
                            linkText={t('auth.form.change-email')}
                        />
                    </React.Fragment>
                ) : null}

                <Divider subtle className="mt-3" />

                <ButtonBase
                    size="sm"
                    color="danger"
                    onClick={handleLogoutAll}
                    className="mt-3"
                >
                    {t('app.profile.settings.logout-all')}
                </ButtonBase>

                <Divider subtle className="mt-3" />
            </section>

            <ButtonBase
                size="sm"
                color="subtle"
                onClick={handleCookieSettings}
                className="mt-2"
            >
                {t('app.cookies.modal.title')}
            </ButtonBase>
        </div>
    );
};
