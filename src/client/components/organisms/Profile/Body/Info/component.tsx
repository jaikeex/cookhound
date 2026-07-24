'use client';

import React, { useCallback } from 'react';
import { AuthType, type User } from '@/common/types';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { ButtonRow } from '@/client/components/molecules/Profile/Settings/ButtonRow';
import { DangerZone } from '@/client/components/organisms/Profile/DangerZone';
import { Divider } from '@/client/components/atoms/Divider';
import { LinkRow } from '@/client/components/molecules/Profile/Settings/LinkRow';
import { PendingDeletionBanner } from '@/client/components/molecules/Banner/PendingDeletionBanner';
import { TextInputRow } from '@/client/components/molecules/Profile/Settings/TextInputRow';
import { Typography } from '@/client/components/atoms/Typography';
import { useSnackbar } from '@/client/store';
import { useModal } from '@/client/store';
import { ConsentSettingsModal } from '@/client/components/organisms/Modal/ConsentSettingsModal';
import { LogoutAllConfirmModal } from '@/client/components/organisms/Modal/LogoutAllConfirmModal';
import { chqc, QUERY_KEYS } from '@/client/data';
import { useQueryClient } from '@tanstack/react-query';
import { useLogout } from '@/client/hooks';
import { ROUTES } from '@/common/constants';
import { t } from '@/client/locales';

export type ProfileBodyInfoProps = Readonly<{
    user: User;
}>;

export const ProfileBodyInfo: React.FC<ProfileBodyInfoProps> = ({ user }) => {
    const { alert } = useSnackbar();
    const { openModal } = useModal();

    const { logout: handleLogout } = useLogout();
    const queryClient = useQueryClient();

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
        [updateUserById, user.id, alert]
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
            {user.deletionScheduledFor ? (
                <PendingDeletionBanner
                    deletionScheduledFor={user.deletionScheduledFor}
                />
            ) : null}

            <section>
                <Typography as="h2" variant="heading-sm">
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

                {user.authType === AuthType.Local ? (
                    <React.Fragment>
                        <Divider subtle className="mt-3" />

                        <LinkRow
                            className="mt-3"
                            heading={t('app.profile.settings.password')}
                            href={
                                ROUTES.auth.resetPassword +
                                '?email=' +
                                user.email
                            }
                            linkText={t('app.profile.settings.password-link')}
                        />

                        <Divider subtle className="mt-3" />

                        <LinkRow
                            className="mt-3"
                            heading={t('app.profile.settings.email')}
                            href={ROUTES.user.changeEmail}
                            linkText={t('auth.form.change-email')}
                        />
                    </React.Fragment>
                ) : null}

                {/* <Divider subtle className="mt-3" /> */}

                <Typography as="h2" variant="heading-sm" className="mt-8">
                    {t('app.profile.settings.section-privacy')}
                </Typography>

                <Divider className="mt-1" />

                <Typography
                    as="h3"
                    variant="heading-xs"
                    className="font-semibold mt-3"
                >
                    {t('app.profile.settings.logout')}
                </Typography>

                <div className="flex items-stretch justify-between gap-4 mt-3">
                    <ButtonBase
                        className="w-full"
                        size="md"
                        onClick={handleLogout}
                        color="primary"
                    >
                        {t('auth.form.logout')}
                    </ButtonBase>

                    <ButtonBase
                        className="w-full"
                        size="md"
                        onClick={handleLogoutAll}
                        color="danger"
                    >
                        {t('app.profile.settings.logout-all')}
                    </ButtonBase>
                </div>

                <Divider subtle className="mt-3" />

                <ButtonRow
                    className="mt-3"
                    buttonSize="md"
                    buttonText={t('app.cookies.modal.title')}
                    outlined
                    onClick={handleCookieSettings}
                />

                <Divider subtle className="mt-3" />

                <DangerZone className="mt-6" />
            </section>
        </div>
    );
};
