import React from 'react';
import { classNames } from '@/client/utils';
import type { TableColumn } from '@/client/components/molecules/Table';
import { resolveCell } from '@/client/components/molecules/Table/utils';

export type TableRowProps<T> = Readonly<{
    columns: TableColumn<T>[];
    item: T;
    rowIndex: number;
    lastIndex: number;
}>;

export function TableRow<T>({
    columns,
    item,
    rowIndex,
    lastIndex
}: TableRowProps<T>): React.ReactNode {
    return (
        <tr className="border-b border-gray-100 last:border-none dark:border-gray-800">
            {columns.map((col, colIndex) => (
                <td
                    key={col.key}
                    className={classNames(
                        'py-2',
                        colIndex < lastIndex && 'pr-4',
                        col.className
                    )}
                >
                    {resolveCell(col, item, rowIndex)}
                </td>
            ))}
        </tr>
    );
}
