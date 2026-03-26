'use client';

import React, { useCallback } from 'react';
import type { ModalProps } from '@/client/components/organisms/Modal/types';
import { ButtonBase, Chip, Typography } from '@/client/components';
import { AdminActionConfirmModal } from '@/client/components/organisms/Modal/AdminActionConfirmModal';
import { useLocale, useSnackbar, useModal } from '@/client/store';
import { chqc } from '@/client/request/queryClient';
import { useQueryClient } from '@tanstack/react-query';
import { ADMIN_QUERY_KEYS } from '@/client/request/queryClient/admin/types';
import { formatDate } from '@/client/utils';
import { AuthType, Status, UserRole } from '@/common/types';

export type AdminUserDetailModalProps = Readonly<{
    userId: number;
    onClose?: () => void;
}> &
    ModalProps;

//~=================================================================================================~//
//$                                          HELPERS                                                 $//
//~=================================================================================================~//

function getStatusChipColor(status: string): 'primary' | 'danger' | 'warning' {
    switch (status) {
        case Status.Active:
            return 'primary';
        case Status.Banned:
            return 'danger';
        case Status.PendingDeletion:
            return 'warning';
        default:
            return 'primary';
    }
}

function getRoleChipColor(role: string): 'primary' | 'secondary' {
    return role === UserRole.Admin ? 'primary' : 'secondary';
}

//~=================================================================================================~//
//$                                         COMPONENT                                                $//
//~=================================================================================================~//

export const AdminUserDetailModal: React.FC<AdminUserDetailModalProps> = ({
    userId,
    onClose: _onClose,
    close: _close
}) => {
    const { t } = useLocale();
    const { alert } = useSnackbar();
    const { openModal } = useModal();
    const queryClient = useQueryClient();

    const { data: user, isLoading } = chqc.admin.useAdminUserDetail(userId);

    //~---------------------------------------------------------------------------------------------~//
    //$                                        MUTATIONS                                             $//
    //~---------------------------------------------------------------------------------------------~//

    const { mutateAsync: changeRole } = chqc.admin.useChangeUserRole({
        onSuccess: () => {
            alert({
                variant: 'success',
                message: t('admin.users.action.changeRole.success')
            });
            invalidateQueries();
        },
        onError: () => {
            alert({
                variant: 'error',
                message: t('admin.users.action.changeRole.error')
            });
        }
    });

    const { mutateAsync: changeStatus } = chqc.admin.useChangeUserStatus({
        onSuccess: () => {
            alert({
                variant: 'success',
                message:
                    user?.status === Status.Banned
                        ? t('admin.users.action.unban.success')
                        : t('admin.users.action.ban.success')
            });
            invalidateQueries();
        },
        onError: () => {
            alert({
                variant: 'error',
                message: t('admin.users.action.ban.error')
            });
        }
    });

    const { mutateAsync: forceLogout } = chqc.admin.useForceLogout({
        onSuccess: () => {
            alert({
                variant: 'success',
                message: t('admin.users.action.forceLogout.success')
            });
        },
        onError: () => {
            alert({
                variant: 'error',
                message: t('admin.users.action.forceLogout.error')
            });
        }
    });

    const { mutateAsync: forcePasswordReset } =
        chqc.admin.useForcePasswordReset({
            onSuccess: () => {
                alert({
                    variant: 'success',
                    message: t('admin.users.action.forcePasswordReset.success')
                });
            },
            onError: () => {
                alert({
                    variant: 'error',
                    message: t('admin.users.action.forcePasswordReset.error')
                });
            }
        });

    const { mutateAsync: verifyEmail } = chqc.admin.useVerifyEmail({
        onSuccess: () => {
            alert({
                variant: 'success',
                message: t('admin.users.action.verifyEmail.success')
            });
            invalidateQueries();
        },
        onError: () => {
            alert({
                variant: 'error',
                message: t('admin.users.action.verifyEmail.error')
            });
        }
    });

    const { mutateAsync: scheduleDeletion } =
        chqc.admin.useScheduleAccountDeletion({
            onSuccess: () => {
                alert({
                    variant: 'success',
                    message: t('admin.users.action.delete.success')
                });
                invalidateQueries();
            },
            onError: () => {
                alert({
                    variant: 'error',
                    message: t('admin.users.action.delete.error')
                });
            }
        });

    const { mutateAsync: cancelDeletion } = chqc.admin.useCancelAccountDeletion(
        {
            onSuccess: () => {
                alert({
                    variant: 'success',
                    message: t('admin.users.action.cancelDeletion.success')
                });
                invalidateQueries();
            },
            onError: () => {
                alert({
                    variant: 'error',
                    message: t('admin.users.action.cancelDeletion.error')
                });
            }
        }
    );

    //~---------------------------------------------------------------------------------------------~//
    //$                                         HELPERS                                             $//
    //~---------------------------------------------------------------------------------------------~//

    const invalidateQueries = useCallback(() => {
        void queryClient.invalidateQueries({
            queryKey: ADMIN_QUERY_KEYS.users
        });
        void queryClient.invalidateQueries({
            queryKey: [...ADMIN_QUERY_KEYS.userDetail, userId]
        });
    }, [queryClient, userId]);

    //~---------------------------------------------------------------------------------------------~//
    //$                                     ACTION HANDLERS                                         $//
    //~---------------------------------------------------------------------------------------------~//

    const confirmChangeRole = useCallback(() => {
        if (!user) return Promise.resolve();
        const newRole =
            user.role === UserRole.Admin ? UserRole.User : UserRole.Admin;
        return changeRole({ userId, role: newRole });
    }, [user, userId, changeRole]);

    const confirmChangeStatus = useCallback(
        (reason?: string) => {
            if (!user) return Promise.resolve();
            const newStatus =
                user.status !== Status.Banned ? Status.Banned : Status.Active;
            return changeStatus({ userId, status: newStatus, reason });
        },
        [user, userId, changeStatus]
    );

    const confirmForceLogout = useCallback(
        () => forceLogout(userId),
        [forceLogout, userId]
    );

    const confirmForcePasswordReset = useCallback(
        () => forcePasswordReset(userId),
        [forcePasswordReset, userId]
    );

    const confirmVerifyEmail = useCallback(
        () => verifyEmail(userId),
        [verifyEmail, userId]
    );

    const confirmScheduleDeletion = useCallback(
        (reason?: string) => scheduleDeletion({ userId, reason }),
        [scheduleDeletion, userId]
    );

    const confirmCancelDeletion = useCallback(
        () => cancelDeletion(userId),
        [cancelDeletion, userId]
    );

    const handleChangeRole = useCallback(() => {
        if (!user) return;

        const newRole =
            user.role === UserRole.Admin ? UserRole.User : UserRole.Admin;

        openModal((modalClose) => (
            <AdminActionConfirmModal
                close={modalClose}
                title={t('admin.users.action.changeRole')}
                description={t('admin.users.action.changeRole.confirm', {
                    role: newRole
                })}
                confirmLabel={t('admin.users.action.changeRole')}
                onConfirm={confirmChangeRole}
            />
        ));
    }, [user, openModal, confirmChangeRole, t]);

    const handleChangeStatus = useCallback(() => {
        if (!user) return;

        const isBanning = user.status !== Status.Banned;

        openModal((modalClose) => (
            <AdminActionConfirmModal
                close={modalClose}
                title={
                    isBanning
                        ? t('admin.users.action.ban')
                        : t('admin.users.action.unban')
                }
                description={
                    isBanning
                        ? t('admin.users.action.ban.confirm')
                        : t('admin.users.action.unban.confirm')
                }
                confirmLabel={
                    isBanning
                        ? t('admin.users.action.ban')
                        : t('admin.users.action.unban')
                }
                confirmColor={isBanning ? 'danger' : 'warning'}
                withReason
                onConfirm={confirmChangeStatus}
            />
        ));
    }, [user, openModal, confirmChangeStatus, t]);

    const handleForceLogout = useCallback(() => {
        openModal((modalClose) => (
            <AdminActionConfirmModal
                close={modalClose}
                title={t('admin.users.action.forceLogout')}
                description={t('admin.users.action.forceLogout.confirm')}
                confirmLabel={t('admin.users.action.forceLogout')}
                confirmColor="warning"
                onConfirm={confirmForceLogout}
            />
        ));
    }, [openModal, confirmForceLogout, t]);

    const handleForcePasswordReset = useCallback(() => {
        openModal((modalClose) => (
            <AdminActionConfirmModal
                close={modalClose}
                title={t('admin.users.action.forcePasswordReset')}
                description={t('admin.users.action.forcePasswordReset.confirm')}
                confirmLabel={t('admin.users.action.forcePasswordReset')}
                onConfirm={confirmForcePasswordReset}
            />
        ));
    }, [openModal, confirmForcePasswordReset, t]);

    const handleVerifyEmail = useCallback(() => {
        openModal((modalClose) => (
            <AdminActionConfirmModal
                close={modalClose}
                title={t('admin.users.action.verifyEmail')}
                description={t('admin.users.action.verifyEmail.confirm')}
                confirmLabel={t('admin.users.action.verifyEmail')}
                onConfirm={confirmVerifyEmail}
            />
        ));
    }, [openModal, confirmVerifyEmail, t]);

    const handleScheduleDeletion = useCallback(() => {
        openModal((modalClose) => (
            <AdminActionConfirmModal
                close={modalClose}
                title={t('admin.users.action.delete')}
                description={t('admin.users.action.delete.confirm')}
                confirmLabel={t('admin.users.action.delete')}
                confirmColor="danger"
                withReason
                onConfirm={confirmScheduleDeletion}
            />
        ));
    }, [openModal, confirmScheduleDeletion, t]);

    const handleCancelDeletion = useCallback(() => {
        openModal((modalClose) => (
            <AdminActionConfirmModal
                close={modalClose}
                title={t('admin.users.action.cancelDeletion')}
                description={t('admin.users.action.cancelDeletion.confirm')}
                confirmLabel={t('admin.users.action.cancelDeletion')}
                confirmColor="warning"
                onConfirm={confirmCancelDeletion}
            />
        ));
    }, [openModal, confirmCancelDeletion, t]);

    //~---------------------------------------------------------------------------------------------~//
    //$                                          RENDER                                              $//
    //~---------------------------------------------------------------------------------------------~//

    if (isLoading || !user) {
        return (
            <div className="w-full max-w-[90dvw] md:max-w-[50dvw] xl:max-w-[40dvw] px-4 py-6">
                <Typography variant="body-sm">
                    {t('app.general.loading')}
                </Typography>
            </div>
        );
    }

    const isLocalAuth = user.authType === AuthType.Local;
    const canBanOrUnban =
        user.status === Status.Active || user.status === Status.Banned;

    return (
        <div className="flex flex-col w-full max-h-[85dvh] md:max-h-[75dvh] max-w-[90dvw] px-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center gap-4 shrink-0">
                <div>
                    <Typography variant="heading-sm">
                        {user.username}
                    </Typography>
                    <div className="flex gap-2 mt-1">
                        <Chip color={getRoleChipColor(user.role)} size="xs">
                            {user.role}
                        </Chip>
                        <Chip color={getStatusChipColor(user.status)} size="xs">
                            {user.status}
                        </Chip>
                    </div>
                </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-6">
                <InfoRow
                    label={t('admin.users.table.email')}
                    value={user.email}
                />
                <InfoRow
                    label={t('admin.users.table.authType')}
                    value={user.authType}
                />
                <InfoRow
                    label={t('admin.users.detail.emailVerified')}
                    value={
                        user.emailVerified
                            ? t('app.general.yes')
                            : t('app.general.no')
                    }
                />
                <InfoRow
                    label={t('admin.users.table.createdAt')}
                    value={formatDate(user.createdAt)}
                />
                <InfoRow
                    label={t('admin.users.table.lastLogin')}
                    value={user.lastLogin ? formatDate(user.lastLogin) : '—'}
                />
                <InfoRow
                    label={t('admin.users.detail.lastVisit')}
                    value={
                        user.lastVisitedAt
                            ? formatDate(user.lastVisitedAt)
                            : '—'
                    }
                />
                {user.lastPasswordReset ? (
                    <InfoRow
                        label={t('admin.users.detail.lastPasswordReset')}
                        value={formatDate(user.lastPasswordReset)}
                    />
                ) : null}
                {user.deletionScheduledFor ? (
                    <InfoRow
                        label={t('admin.users.detail.deletionScheduledFor')}
                        value={formatDate(user.deletionScheduledFor)}
                    />
                ) : null}
            </div>

            {/* Stats */}
            <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <StatItem
                    label={t('admin.users.detail.recipes')}
                    value={user.recipeCount}
                />
                <StatItem
                    label={t('admin.users.detail.ratings')}
                    value={user.ratingCount}
                />
                <StatItem
                    label={t('admin.users.detail.flags')}
                    value={user.flagCount}
                />
            </div>

            {/* Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <Typography variant="label" className="mb-2">
                    {t('admin.users.detail.actions')}
                </Typography>

                <div className="flex flex-wrap gap-2">
                    <ButtonBase
                        color="subtle"
                        outlined
                        size="sm"
                        onClick={handleChangeRole}
                    >
                        {user.role === UserRole.Admin
                            ? t('admin.users.action.demoteToUser')
                            : t('admin.users.action.promoteToAdmin')}
                    </ButtonBase>

                    {canBanOrUnban ? (
                        <ButtonBase
                            color={
                                user.status === Status.Banned
                                    ? 'warning'
                                    : 'danger'
                            }
                            outlined
                            size="sm"
                            onClick={handleChangeStatus}
                        >
                            {user.status === Status.Banned
                                ? t('admin.users.action.unban')
                                : t('admin.users.action.ban')}
                        </ButtonBase>
                    ) : null}

                    <ButtonBase
                        color="subtle"
                        outlined
                        size="sm"
                        onClick={handleForceLogout}
                    >
                        {t('admin.users.action.forceLogout')}
                    </ButtonBase>

                    {isLocalAuth ? (
                        <ButtonBase
                            color="subtle"
                            outlined
                            size="sm"
                            onClick={handleForcePasswordReset}
                        >
                            {t('admin.users.action.forcePasswordReset')}
                        </ButtonBase>
                    ) : null}

                    {!user.emailVerified ? (
                        <ButtonBase
                            color="subtle"
                            outlined
                            size="sm"
                            onClick={handleVerifyEmail}
                        >
                            {t('admin.users.action.verifyEmail')}
                        </ButtonBase>
                    ) : null}

                    {user.status === Status.PendingDeletion ? (
                        <ButtonBase
                            color="warning"
                            outlined
                            size="sm"
                            onClick={handleCancelDeletion}
                        >
                            {t('admin.users.action.cancelDeletion')}
                        </ButtonBase>
                    ) : (
                        <ButtonBase
                            color="danger"
                            outlined
                            size="sm"
                            onClick={handleScheduleDeletion}
                        >
                            {t('admin.users.action.delete')}
                        </ButtonBase>
                    )}
                </div>
            </div>
        </div>
    );
};

//~=================================================================================================~//
//$                                      HELPER COMPONENTS                                           $//
//~=================================================================================================~//

const InfoRow: React.FC<Readonly<{ label: string; value: string }>> = ({
    label,
    value
}) => (
    <div>
        <Typography
            variant="body-xs"
            className="text-gray-500 dark:text-gray-400"
        >
            {label}
        </Typography>
        <Typography variant="body-sm">{value}</Typography>
    </div>
);

const StatItem: React.FC<Readonly<{ label: string; value: number }>> = ({
    label,
    value
}) => (
    <div className="text-center">
        <Typography variant="heading-xs">{value}</Typography>
        <Typography
            variant="body-xs"
            className="text-gray-500 dark:text-gray-400"
        >
            {label}
        </Typography>
    </div>
);
