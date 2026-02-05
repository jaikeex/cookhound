'use client';

import React, { useCallback, useState } from 'react';
import type { ModalProps } from '@/client/components/organisms/Modal/types';
import {
    ButtonBase,
    Typography,
    PasswordInput,
    FormCheckbox,
    Textarea
} from '@/client/components';
import { useLocale, useSnackbar, useAuth } from '@/client/store';
import { AuthType } from '@/common/types';
import { chqc } from '@/client/request/queryClient';

export type DeleteAccountModalProps = Readonly<{
    onClose?: () => void;
}> &
    ModalProps;

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
    onClose,
    close
}) => {
    const { t } = useLocale();
    const { alert } = useSnackbar();
    const { user } = useAuth();

    const [password, setPassword] = useState('');
    const [reason, setReason] = useState('');
    const [confirmed, setConfirmed] = useState(false);

    const { mutateAsync: initiateAccountDeletion, isPending } =
        chqc.user.useInitiateAccountDeletion({
            onSuccess: () => {
                alert({
                    variant: 'success',
                    message: t('app.profile.deleteAccount.success')
                });
                onClose?.();
                close?.();

                window.location.reload(); // to show the banner
            },
            onError: () => {
                alert({
                    variant: 'error',
                    message: t('app.profile.deleteAccount.error')
                });
            }
        });

    const handleCancel = useCallback(() => {
        onClose?.();
        close?.();
    }, [onClose, close]);

    const handlePasswordChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setPassword(e.target.value);
        },
        []
    );

    const handleReasonChange = useCallback(
        (e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setReason(e.target.value);
        },
        []
    );

    const handleConfirmChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setConfirmed(e.target.checked);
        },
        []
    );

    const handleDelete = useCallback(async () => {
        await initiateAccountDeletion({
            password,
            reason: reason.trim() || undefined
        });
    }, [initiateAccountDeletion, password, reason]);

    const needsPassword = user?.authType === AuthType.Local;
    const canDelete = confirmed && (needsPassword ? password.length > 0 : true);

    return (
        <div className="flex flex-col w-full h-full max-h-[85dvh] md:max-h-[70dvh] max-w-[90dvw] md:max-w-[50dvw] xl:max-w-[40dvw] px-4 overflow-y-auto">
            <Typography variant="heading-sm" className="shrink-0">
                {t('app.profile.deleteAccount.modal.title')}
            </Typography>

            <div className="mt-4 space-y-4 grow overflow-y-auto">
                <div className="bg-danger/10 dark:bg-danger/20 rounded-lg">
                    <Typography className="font-semibold text-danger">
                        {t('app.profile.deleteAccount.modal.warning')}
                    </Typography>
                </div>

                <div className="space-y-3">
                    <div className="bg-primary/5 dark:bg-primary/10 rounded-lg">
                        <Typography variant="body-sm" className="font-semibold">
                            {t('app.profile.deleteAccount.modal.gracePeriod')}
                        </Typography>
                        <Typography variant="body-sm" className="mt-1">
                            {t(
                                'app.profile.deleteAccount.modal.gracePeriod.description'
                            )}
                        </Typography>
                    </div>

                    <div className="bg-primary/5 dark:bg-primary/10 rounded-lg">
                        <Typography variant="body-sm">
                            {t(
                                'app.profile.deleteAccount.modal.contentAnonymization'
                            )}
                        </Typography>
                    </div>
                </div>

                <Textarea
                    id="deletion-reason"
                    name="deletion-reason"
                    label={t('app.profile.deleteAccount.modal.reason')}
                    placeholder={t(
                        'app.profile.deleteAccount.modal.reason.placeholder'
                    )}
                    onChange={handleReasonChange}
                    disabled={isPending}
                    rows={3}
                    className="w-full"
                />

                {needsPassword ? (
                    <PasswordInput
                        id="delete-account-password"
                        name="delete-account-password"
                        label={t('app.profile.deleteAccount.modal.password')}
                        disabled={isPending}
                        onChange={handlePasswordChange}
                        autoComplete="current-password"
                        className="w-full"
                    />
                ) : null}

                <FormCheckbox
                    id="delete-account-confirm"
                    name="delete-account-confirm"
                    label={t('app.profile.deleteAccount.modal.confirm')}
                    onChange={handleConfirmChange}
                    disabled={isPending}
                />
            </div>

            <div className="shrink-0 flex w-full gap-3 mt-6 pt-4">
                <ButtonBase
                    onClick={handleCancel}
                    color="subtle"
                    outlined
                    size="md"
                    className="w-full"
                    disabled={isPending}
                >
                    {t('app.profile.deleteAccount.modal.cancel-button')}
                </ButtonBase>

                <ButtonBase
                    color="danger"
                    onClick={handleDelete}
                    size="md"
                    className="w-full"
                    disabled={isPending || !canDelete}
                >
                    {t('app.profile.deleteAccount.modal.delete-button')}
                </ButtonBase>
            </div>
        </div>
    );
};
