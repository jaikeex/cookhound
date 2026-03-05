import React from 'react';
import { classNames } from '@/client/utils';
import type { TableColumn } from '@/client/components/molecules/Table';

export type TableHeadProps<T> = Readonly<{
    columns: TableColumn<T>[];
    lastIndex: number;
}>;

export function TableHead<T>({
    columns,
    lastIndex
}: TableHeadProps<T>): React.ReactNode {
    return (
        <thead>
            <tr className="border-b border-gray-200 text-left text-secondary/60 dark:border-gray-700">
                {columns.map((col, i) => (
                    <th
                        key={col.key}
                        className={classNames(
                            'pb-2 font-medium',
                            i < lastIndex && 'pr-4',
                            col.className
                        )}
                    >
                        {col.header}
                    </th>
                ))}
            </tr>
        </thead>
    );
}
