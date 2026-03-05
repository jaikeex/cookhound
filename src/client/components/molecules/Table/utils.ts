import type { TableColumn } from './types';

/**
 * Resolves a cell value from a column definition and a data item.
 */
export function resolveCell<T>(
    column: TableColumn<T>,
    item: T,
    index: number
): React.ReactNode {
    if (column.render) {
        return column.render(item, index);
    }

    if (column.accessor) {
        return typeof column.accessor === 'function'
            ? column.accessor(item)
            : (item[column.accessor] as React.ReactNode);
    }

    return null;
}
