'use client';

import React, { useCallback, useRef, useState } from 'react';
import type { ModalProps } from '@/client/components/organisms/Modal/types';
import { ButtonBase, TextInput, Typography } from '@/client/components';
import { useLocale } from '@/client/store';

export type AdminActionConfirmModalProps = Readonly<{
    title: string;
    description: string;
    confirmLabel: string;
    confirmColor?: 'danger' | 'primary' | 'warning';
    withReason?: boolean;
    onConfirm: (reason?: string) => Promise<void>;
    onClose?: () => void;
    children?: React.ReactNode;
}> &
    ModalProps;

export const AdminActionConfirmModal: React.FC<
    AdminActionConfirmModalProps
> = ({
    title,
    description,
    confirmLabel,
    confirmColor = 'primary',
    withReason = false,
    onConfirm,
    onClose,
    close,
    children
}) => {
    const { t } = useLocale();
    const [isPending, setIsPending] = useState(false);
    const reasonRef = useRef('');

    const handleCancel = useCallback(() => {
        onClose?.();
        close?.();
    }, [onClose, close]);

    const handleConfirm = useCallback(async () => {
        setIsPending(true);

        try {
            const reason = reasonRef.current.trim() || undefined;
            await onConfirm(reason);
            onClose?.();
            close?.();
        } finally {
            setIsPending(false);
        }
    }, [onConfirm, onClose, close]);

    const handleReasonChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            reasonRef.current = e.target.value;
        },
        []
    );

    return (
        <div className="flex flex-col w-full max-w-[90dvw] md:max-w-[40dvw] px-4">
            <Typography variant="heading-sm" className="shrink-0">
                {title}
            </Typography>

            <Typography
                variant="body-sm"
                className="mt-3 text-gray-700 dark:text-gray-300"
            >
                {description}
            </Typography>

            {withReason ? (
                <div className="mt-4">
                    <TextInput
                        id="admin-action-reason"
                        name="reason"
                        label={t('admin.users.action.reason')}
                        placeholder={t('admin.users.action.reason.placeholder')}
                        onChange={handleReasonChange}
                        disabled={isPending}
                    />
                </div>
            ) : null}

            {children ? <div className="mt-4">{children}</div> : null}

            <div className="shrink-0 flex w-full gap-3 mt-6 pt-4">
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
                    color={confirmColor}
                    onClick={handleConfirm}
                    size="md"
                    className="w-full"
                    disabled={isPending}
                >
                    {confirmLabel}
                </ButtonBase>
            </div>
        </div>
    );
};
