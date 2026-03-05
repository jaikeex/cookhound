import React, { useCallback } from 'react';
import { Typography, Pagination } from '@/client/components';
import { classNames } from '@/client/utils';
import { TableHead } from './TableHead';
import { TableRow } from './TableRow';
import type { TableProps } from './types';

export const Table = <T,>({
    columns,
    data,
    rowKey,
    title,
    emptyText,
    pagination,
    className
}: TableProps<T>): React.ReactNode => {
    const lastIndex = columns.length - 1;

    const defaultRowKeyFn = useCallback(
        (_: T, rowIndex: number) => rowIndex,
        []
    );

    const rowKeyFn = rowKey ?? defaultRowKeyFn;

    if (!data || data?.length === 0) {
        return <Typography variant="body-sm">{emptyText ?? '—'}</Typography>;
    }

    return (
        <div
            className={classNames(
                'overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700',
                className
            )}
        >
            <div className="p-4">
                {title ? (
                    <Typography variant="label" className="mb-3">
                        {title}
                    </Typography>
                ) : null}

                <table className="w-full text-sm">
                    <TableHead columns={columns} lastIndex={lastIndex} />

                    <tbody>
                        {data?.map((item, rowIndex) => (
                            <TableRow
                                key={rowKeyFn(item, rowIndex)}
                                columns={columns}
                                item={item}
                                rowIndex={rowIndex}
                                lastIndex={lastIndex}
                            />
                        ))}
                    </tbody>
                </table>

                {pagination ? (
                    <Pagination {...pagination} className="mt-4" />
                ) : null}
            </div>
        </div>
    );
};
