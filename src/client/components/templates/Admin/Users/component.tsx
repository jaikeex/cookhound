'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    Chip,
    Select,
    Table,
    TextInput,
    Typography
} from '@/client/components';
import type { SelectOption } from '@/client/components';
import type { TableColumn } from '@/client/components';
import { AdminUserDetailModal } from '@/client/components/organisms/Modal/AdminUserDetailModal';
import { useLocale, useModal } from '@/client/store';
import { chqc } from '@/client/request/queryClient';
import { formatDate } from '@/client/utils';
import { Status, UserRole } from '@/common/types';
import type { AdminUserListItemDTO } from '@/common/types';

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

export const AdminUsersTemplate: React.FC = () => {
    const { t } = useLocale();
    const { openModal } = useModal();

    // Filter & pagination state
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('');
    const [authType, setAuthType] = useState('');
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    // Debounce timer for search
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setSearch(value);

            if (debounceRef.current) {
                clearTimeout(debounceRef.current);
            }

            debounceRef.current = setTimeout(() => {
                setDebouncedSearch(value);
                setPage(1);
            }, 300);
        },
        []
    );

    // Build query params (omit empty strings)
    const queryParams = useMemo(() => {
        const params: Record<string, string | number | undefined> = {
            page,
            pageSize
        };

        if (debouncedSearch) params.search = debouncedSearch;
        if (role) params.role = role;
        if (status) params.status = status;
        if (authType) params.authType = authType;

        return params;
    }, [page, pageSize, debouncedSearch, role, status, authType]);

    const { data, isLoading } = chqc.admin.useAdminUsers(queryParams);

    // Filter options
    const roleOptions: SelectOption[] = useMemo(
        () => [
            { value: '', label: t('admin.users.filter.all') },
            { value: 'user', label: 'User' },
            { value: 'admin', label: 'Admin' }
        ],
        [t]
    );

    const statusOptions: SelectOption[] = useMemo(
        () => [
            { value: '', label: t('admin.users.filter.all') },
            { value: 'active', label: 'Active' },
            { value: 'banned', label: 'Banned' },
            {
                value: 'pending_deletion',
                label: 'Pending Deletion'
            }
        ],
        [t]
    );

    const authTypeOptions: SelectOption[] = useMemo(
        () => [
            { value: '', label: t('admin.users.filter.all') },
            { value: 'local', label: 'Local' },
            { value: 'google', label: 'Google' }
        ],
        [t]
    );

    // Row click handler
    const handleRowClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            const userId = Number(e.currentTarget.dataset.userId);
            openModal((modalClose) => (
                <AdminUserDetailModal userId={userId} close={modalClose} />
            ));
        },
        [openModal]
    );

    // Table columns
    const columns: TableColumn<AdminUserListItemDTO>[] = useMemo(
        () => [
            {
                key: 'username',
                header: t('admin.users.table.username'),
                render: (item) => (
                    <button
                        className="text-primary-600 dark:text-primary-400 hover:underline cursor-pointer font-medium"
                        data-user-id={item.id}
                        onClick={handleRowClick}
                    >
                        {item.username}
                    </button>
                )
            },
            {
                key: 'email',
                header: t('admin.users.table.email'),
                accessor: 'email'
            },
            {
                key: 'role',
                header: t('admin.users.table.role'),
                render: (item) => (
                    <Chip color={getRoleChipColor(item.role)} size="xs">
                        {item.role}
                    </Chip>
                )
            },
            {
                key: 'status',
                header: t('admin.users.table.status'),
                render: (item) => (
                    <Chip color={getStatusChipColor(item.status)} size="xs">
                        {item.status}
                    </Chip>
                )
            },
            {
                key: 'authType',
                header: t('admin.users.table.authType'),
                accessor: 'authType'
            },
            {
                key: 'createdAt',
                header: t('admin.users.table.createdAt'),
                render: (item) => formatDate(item.createdAt)
            },
            {
                key: 'lastLogin',
                header: t('admin.users.table.lastLogin'),
                render: (item) =>
                    item.lastLogin ? formatDate(item.lastLogin) : '—'
            }
        ],
        [t, handleRowClick]
    );

    const getRowKey = useCallback((item: AdminUserListItemDTO) => item.id, []);

    // Filter change handlers
    const handleRoleChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setRole(e.target.value);
            setPage(1);
        },
        []
    );

    const handleStatusChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setStatus(e.target.value);
            setPage(1);
        },
        []
    );

    const handleAuthTypeChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setAuthType(e.target.value);
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

    return (
        <div className="flex flex-col gap-6">
            <div>
                <Typography variant="heading-lg">
                    {t('admin.users.title')}
                </Typography>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-12">
                <TextInput
                    id="admin-user-search"
                    name="search"
                    placeholder={t('admin.users.search.placeholder')}
                    label={'hledat'}
                    value={search}
                    onChange={handleSearchChange}
                    className="md:min-w-96"
                />

                <div className="flex flex-col md:flex-row gap-3 w-full">
                    <Select
                        id="admin-user-role"
                        name="role"
                        label={t('admin.users.filter.role')}
                        options={roleOptions}
                        defaultValue=""
                        onChange={handleRoleChange}
                        className="md:min-w-24 md:max-w-48"
                    />

                    <Select
                        id="admin-user-status"
                        name="status"
                        label={t('admin.users.filter.status')}
                        options={statusOptions}
                        defaultValue=""
                        onChange={handleStatusChange}
                        className="md:min-w-24 md:max-w-48"
                    />

                    <Select
                        id="admin-user-auth-type"
                        name="authType"
                        label={t('admin.users.filter.authType')}
                        options={authTypeOptions}
                        defaultValue=""
                        onChange={handleAuthTypeChange}
                        className="md:min-w-24 md:max-w-48"
                    />
                </div>
            </div>

            {/* Table */}
            {isLoading ? (
                <Typography variant="body-sm">
                    {t('app.general.loading')}
                </Typography>
            ) : (
                <Table
                    columns={columns}
                    data={data?.users ?? []}
                    rowKey={getRowKey}
                    emptyText={t('admin.users.table.noUsers')}
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
