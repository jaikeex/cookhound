'use client';

import React, { useCallback, useMemo } from 'react';
import { Typography, ButtonBase } from '@/client/components';
import { useLocale, useSnackbar } from '@/client/store';
import { chqc } from '@/client/request/queryClient';
import { classNames } from '@/client/utils';

export type PendingDeletionBannerProps = Readonly<{
    deletionScheduledFor: string;
}>;

export const PendingDeletionBanner: React.FC<PendingDeletionBannerProps> = ({
    deletionScheduledFor
}) => {
    const { t } = useLocale();
    const { alert } = useSnackbar();

    const { mutateAsync: cancelDeletion, isPending } =
        chqc.user.useCancelAccountDeletion({
            onSuccess: () => {
                alert({
                    variant: 'success',
                    message: t('app.profile.pendingDeletion.cancel.success')
                });

                window.location.reload(); // to remove the banner
            },
            onError: () => {
                alert({
                    variant: 'error',
                    message: t('app.profile.pendingDeletion.cancel.error')
                });
            }
        });

    const { daysRemaining, formattedDate, isLessThan24Hours } = useMemo(() => {
        const scheduledDate = new Date(deletionScheduledFor);
        const now = new Date();
        const diffMs = scheduledDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const isLess24h = diffDays < 1;

        return {
            daysRemaining: diffDays,
            formattedDate: scheduledDate.toLocaleDateString(),
            isLessThan24Hours: isLess24h
        };
    }, [deletionScheduledFor]);

    const handleCancelDeletion = useCallback(async () => {
        await cancelDeletion(undefined);
    }, [cancelDeletion]);

    const message = isLessThan24Hours
        ? t('app.profile.pendingDeletion.banner.message.hours', {
              date: formattedDate
          })
        : t('app.profile.pendingDeletion.banner.message', {
              days: daysRemaining.toString(),
              date: formattedDate
          });

    return (
        <div
            className={classNames(
                'w-full bg-warning/10 dark:bg-warning/20',
                'border border-warning',
                'p-4 mb-6 rounded-lg'
            )}
        >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <Typography
                        variant="body-md"
                        className="font-bold text-warning mb-1"
                    >
                        {t('app.profile.pendingDeletion.banner.title')}
                    </Typography>
                    <Typography
                        variant="body-sm"
                        className="text-neutral-700 dark:text-neutral-300"
                    >
                        {message}
                    </Typography>
                </div>
                <ButtonBase
                    onClick={handleCancelDeletion}
                    disabled={isPending}
                    color="warning"
                    size="sm"
                    className="md:flex-shrink-0"
                >
                    {t('app.profile.pendingDeletion.banner.cancel')}
                </ButtonBase>
            </div>
        </div>
    );
};
