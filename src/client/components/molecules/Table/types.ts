import type { PaginationProps } from '@/client/components';

export type TablePaginationProps = Omit<PaginationProps, 'className'>;

export type TableColumn<T> = Readonly<{
    className?: string;
    key: string;
    header: string;
    /**
     * 2 options here:
     *  - either pass a field key present in the data objects.
     *  - or pass a function that returns what will be displayed.
     */
    accessor?: keyof T | ((item: T) => React.ReactNode);
    /**
     * Has priority over accessor.
     */
    render?: (item: T, index: number) => React.ReactNode;
}>;

export type TableProps<T> = Readonly<{
    className?: string;
    columns: TableColumn<T>[];
    data: T[];
    emptyText?: string;
    pagination?: TablePaginationProps;
    rowKey?: (item: T, index: number) => string | number;
    title?: string;
}>;
