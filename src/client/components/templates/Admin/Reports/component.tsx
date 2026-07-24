'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { Chip } from '@/client/components/atoms/Chip';
import { Select } from '@/client/components/molecules/Form/Select';
import { Table } from '@/client/components/molecules/Table';
import { Typography } from '@/client/components/atoms/Typography';
import type { SelectOption } from '@/client/components/molecules/Form/Select';
import type { TableColumn } from '@/client/components/molecules/Table';
import { AdminReportDetailModal } from '@/client/components/organisms/Modal/AdminReportDetailModal';
import { useModal } from '@/client/store';
import { chqc } from '@/client/data';
import {
    formatDate,
    REPORT_REASON_LABEL_KEY,
    REPORT_STATUS_CHIP_COLOR,
    REPORT_STATUS_LABEL_KEY,
    REPORT_TARGET_TYPE_LABEL_KEY
} from '@/client/utils';
import { ReportTargetType } from '@/common/constants';
import { ReportStatus, type ContentReportDTO } from '@/common/types';
import { t } from '@/client/locales';

//~=================================================================================================~//
//$                                         COMPONENT                                                $//
//~=================================================================================================~//

export const AdminReportsTemplate: React.FC = () => {
    const { openModal } = useModal();

    const [status, setStatus] = useState('');
    const [targetType, setTargetType] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    const queryParams = useMemo(() => {
        const params: Record<string, string | number | undefined> = {
            page,
            pageSize
        };

        if (status) {
            params.status = status;
        }

        if (targetType) {
            params.targetType = targetType;
        }

        return params;
    }, [page, pageSize, status, targetType]);

    const { data, isLoading } = chqc.admin.useAdminReports(queryParams);

    //~---------------------------------------------------------------------------------------------~//
    //$                                       FILTER OPTIONS                                         $//
    //~---------------------------------------------------------------------------------------------~//

    const statusOptions: SelectOption[] = useMemo(
        () => [
            { value: '', label: t('admin.reports.filter.all') },
            ...Object.values(ReportStatus).map((value) => ({
                value,
                label: t(REPORT_STATUS_LABEL_KEY[value])
            }))
        ],
        []
    );

    const targetTypeOptions: SelectOption[] = useMemo(
        () => [
            { value: '', label: t('admin.reports.filter.all') },
            ...Object.values(ReportTargetType).map((value) => ({
                value,
                label: t(REPORT_TARGET_TYPE_LABEL_KEY[value])
            }))
        ],
        []
    );

    //~---------------------------------------------------------------------------------------------~//
    //$                                         HANDLERS                                             $//
    //~---------------------------------------------------------------------------------------------~//

    const handleRowClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            const reportId = Number(e.currentTarget.dataset.reportId);
            openModal((modalClose) => (
                <AdminReportDetailModal
                    reportId={reportId}
                    close={modalClose}
                />
            ));
        },
        [openModal]
    );

    const handleStatusChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setStatus(e.target.value);
            setPage(1);
        },
        []
    );

    const handleTargetTypeChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setTargetType(e.target.value);
            setPage(1);
        },
        []
    );

    const handlePageChange = useCallback((newPage: number) => {
        setPage(newPage);
    }, []);

    const handlePageSizeChange = useCallback((newPageSize: number) => {
        setPageSize(newPageSize);
        setPage(1);
    }, []);

    //~---------------------------------------------------------------------------------------------~//
    //$                                          COLUMNS                                             $//
    //~---------------------------------------------------------------------------------------------~//

    const columns: TableColumn<ContentReportDTO>[] = useMemo(
        () => [
            {
                key: 'target',
                header: t('admin.reports.table.target'),
                render: (item) => (
                    <button
                        className="text-primary-600 dark:text-primary-400 hover:underline cursor-pointer font-medium text-left"
                        data-report-id={item.id}
                        onClick={handleRowClick}
                    >
                        {item.targetLabel}
                    </button>
                )
            },
            {
                key: 'targetType',
                header: t('admin.reports.table.type'),
                render: (item) => (
                    <Chip color="secondary" size="xs">
                        {t(REPORT_TARGET_TYPE_LABEL_KEY[item.targetType])}
                    </Chip>
                )
            },
            {
                key: 'reason',
                header: t('admin.reports.table.reason'),
                render: (item) => t(REPORT_REASON_LABEL_KEY[item.reason])
            },
            {
                key: 'reporter',
                header: t('admin.reports.table.reporter'),
                render: (item) => item.reporterUsername ?? `#${item.reporterId}`
            },
            {
                key: 'status',
                header: t('admin.reports.table.status'),
                render: (item) => (
                    <Chip
                        color={REPORT_STATUS_CHIP_COLOR[item.status]}
                        size="xs"
                    >
                        {t(REPORT_STATUS_LABEL_KEY[item.status])}
                    </Chip>
                )
            },
            {
                key: 'createdAt',
                header: t('admin.reports.table.createdAt'),
                render: (item) => formatDate(item.createdAt)
            }
        ],
        [handleRowClick]
    );

    const getRowKey = useCallback((item: ContentReportDTO) => item.id, []);

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Typography variant="heading-lg">
                    {t('admin.reports.title')}
                </Typography>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-3">
                <Select
                    id="admin-report-status"
                    name="status"
                    label={t('admin.reports.filter.status')}
                    options={statusOptions}
                    defaultValue=""
                    onChange={handleStatusChange}
                    className="md:min-w-24 md:max-w-48"
                />

                <Select
                    id="admin-report-target-type"
                    name="targetType"
                    label={t('admin.reports.filter.targetType')}
                    options={targetTypeOptions}
                    defaultValue=""
                    onChange={handleTargetTypeChange}
                    className="md:min-w-24 md:max-w-48"
                />
            </div>

            {/* Table */}
            {isLoading ? (
                <Typography variant="body-sm">
                    {t('app.general.loading')}
                </Typography>
            ) : (
                <Table
                    columns={columns}
                    data={data?.reports ?? []}
                    rowKey={getRowKey}
                    emptyText={t('admin.reports.table.noReports')}
                    pagination={{
                        page,
                        pageSize,
                        totalItems: data?.totalItems ?? 0,
                        onPageChange: handlePageChange,
                        onPageSizeChange: handlePageSizeChange
                    }}
                />
            )}
        </div>
    );
};
