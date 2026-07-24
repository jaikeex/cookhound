'use client';

import React, { useCallback } from 'react';
import type { ModalProps } from '@/client/components/organisms/Modal/types';
import { ButtonBase } from '@/client/components/atoms/Button/Base';
import { Chip } from '@/client/components/atoms/Chip';
import { Typography } from '@/client/components/atoms/Typography';
import { AdminActionConfirmModal } from '@/client/components/organisms/Modal/AdminActionConfirmModal';
import { useSnackbar, useModal } from '@/client/store';
import { chqc } from '@/client/data';
import { useQueryClient } from '@tanstack/react-query';
import { ADMIN_QUERY_KEYS } from '@/client/data/admin';
import {
    formatDate,
    REPORT_REASON_LABEL_KEY,
    REPORT_STATUS_CHIP_COLOR,
    REPORT_STATUS_LABEL_KEY,
    REPORT_TARGET_TYPE_LABEL_KEY
} from '@/client/utils';
import { ReportStatus } from '@/common/types';
import { t } from '@/client/locales';

export type AdminReportDetailModalProps = Readonly<{
    reportId: number;
}> &
    ModalProps;

//~=================================================================================================~//
//$                                          HELPERS                                                 $//
//~=================================================================================================~//

const InfoRow: React.FC<
    Readonly<{ label: string; children: React.ReactNode }>
> = ({ label, children }) => (
    <div className="flex flex-col gap-0.5">
        <Typography
            variant="label"
            className="uppercase tracking-wider text-secondary/60"
        >
            {label}
        </Typography>
        <Typography variant="body-sm" className="wrap-break-word">
            {children}
        </Typography>
    </div>
);

//~=================================================================================================~//
//$                                         COMPONENT                                                $//
//~=================================================================================================~//

export const AdminReportDetailModal: React.FC<AdminReportDetailModalProps> = ({
    reportId
}) => {
    const { alert } = useSnackbar();
    const { openModal } = useModal();
    const queryClient = useQueryClient();

    const { data: report, isLoading } =
        chqc.admin.useAdminReportDetail(reportId);

    const invalidateQueries = useCallback(() => {
        void queryClient.invalidateQueries({
            queryKey: [ADMIN_QUERY_KEYS.namespace, 'reports']
        });
        void queryClient.invalidateQueries({
            queryKey: ADMIN_QUERY_KEYS.reportDetail(reportId)
        });
        void queryClient.invalidateQueries({
            queryKey: ADMIN_QUERY_KEYS.dashboardStats
        });
    }, [queryClient, reportId]);

    const { mutateAsync: resolveReport } = chqc.admin.useResolveReport({
        onSuccess: () => {
            alert({
                variant: 'success',
                message: t('admin.reports.action.success')
            });
            invalidateQueries();
        },
        onError: () => {
            alert({
                variant: 'error',
                message: t('admin.reports.action.error')
            });
        }
    });

    const handleMarkReviewing = useCallback(() => {
        void resolveReport({ reportId, status: ReportStatus.REVIEWING });
    }, [resolveReport, reportId]);

    // Returns a stable confirm handler bound to the chosen terminal status,
    // so the JSX below passes a function reference rather than an inline arrow.
    const resolveWith = useCallback(
        (status: ReportStatus.ACTIONED | ReportStatus.DISMISSED) =>
            async (reason?: string) => {
                await resolveReport({ reportId, status, resolution: reason });
            },
        [resolveReport, reportId]
    );

    const openDecision = useCallback(
        (status: ReportStatus.ACTIONED | ReportStatus.DISMISSED) => {
            const isAction = status === ReportStatus.ACTIONED;

            openModal((close) => (
                <AdminActionConfirmModal
                    title={
                        isAction
                            ? t('admin.reports.action.action.title')
                            : t('admin.reports.action.dismiss.title')
                    }
                    description={
                        isAction
                            ? t('admin.reports.action.action.description')
                            : t('admin.reports.action.dismiss.description')
                    }
                    confirmLabel={
                        isAction
                            ? t('admin.reports.action.action')
                            : t('admin.reports.action.dismiss')
                    }
                    confirmColor={isAction ? 'danger' : 'primary'}
                    withReason
                    onConfirm={resolveWith(status)}
                    close={close}
                />
            ));
        },
        [openModal, resolveWith]
    );

    const handleDismiss = useCallback(
        () => openDecision(ReportStatus.DISMISSED),
        [openDecision]
    );

    const handleAction = useCallback(
        () => openDecision(ReportStatus.ACTIONED),
        [openDecision]
    );

    if (isLoading || !report) {
        return (
            <div className="flex flex-col w-full max-w-[90dvw] md:max-w-[40dvw] px-4">
                <Typography variant="body-sm">
                    {t('app.general.loading')}
                </Typography>
            </div>
        );
    }

    const isTerminal =
        report.status === ReportStatus.ACTIONED ||
        report.status === ReportStatus.DISMISSED;

    return (
        <div className="flex flex-col w-full max-w-[90dvw] md:max-w-[40dvw] px-4">
            <div className="flex items-center gap-3">
                <Typography variant="heading-sm">
                    {t('admin.reports.detail.title')}
                </Typography>

                <Chip color={REPORT_STATUS_CHIP_COLOR[report.status]} size="xs">
                    {t(REPORT_STATUS_LABEL_KEY[report.status])}
                </Chip>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                <InfoRow label={t('admin.reports.detail.target')}>
                    <a
                        href={report.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-primary-600 dark:text-primary-400 hover:underline"
                    >
                        {report.targetLabel}
                    </a>
                    <span className="ml-2 text-secondary/60">
                        ({t(REPORT_TARGET_TYPE_LABEL_KEY[report.targetType])})
                    </span>
                </InfoRow>

                <InfoRow label={t('admin.reports.detail.reason')}>
                    {t(REPORT_REASON_LABEL_KEY[report.reason])}
                </InfoRow>

                <InfoRow label={t('admin.reports.detail.reporter')}>
                    {report.reporterUsername ?? `#${report.reporterId}`}
                </InfoRow>

                <InfoRow label={t('admin.reports.detail.createdAt')}>
                    {formatDate(report.createdAt)}
                </InfoRow>
            </div>

            <div className="mt-4">
                <InfoRow label={t('admin.reports.detail.details')}>
                    {report.details ?? t('admin.reports.detail.noDetails')}
                </InfoRow>
            </div>

            {isTerminal ? (
                <div className="mt-4 flex flex-col gap-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <InfoRow label={t('admin.reports.detail.reviewedAt')}>
                        {report.reviewedAt
                            ? formatDate(report.reviewedAt)
                            : '—'}
                    </InfoRow>

                    <InfoRow label={t('admin.reports.detail.resolution')}>
                        {report.resolution ?? '—'}
                    </InfoRow>
                </div>
            ) : (
                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    {report.status === ReportStatus.PENDING ? (
                        <ButtonBase
                            color="subtle"
                            outlined
                            className="w-full"
                            onClick={handleMarkReviewing}
                        >
                            {t('admin.reports.action.markReviewing')}
                        </ButtonBase>
                    ) : null}

                    <ButtonBase
                        color="subtle"
                        outlined
                        className="w-full"
                        onClick={handleDismiss}
                    >
                        {t('admin.reports.action.dismiss')}
                    </ButtonBase>

                    <ButtonBase
                        color="danger"
                        className="w-full"
                        onClick={handleAction}
                    >
                        {t('admin.reports.action.action')}
                    </ButtonBase>
                </div>
            )}
        </div>
    );
};
