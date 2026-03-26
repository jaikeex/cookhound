import React, { useCallback, useMemo } from 'react';
import { Typography, Table } from '@/client/components';
import type { TableColumn } from '@/client/components';
import {
    formatSchemaType,
    formatConstraints,
    isPropertyNullable,
    resolveSchemaForTable
} from '@/client/components/templates/Admin/ApiDocs/utils';

type SchemaRow = Readonly<{
    name: string;
    prop: Record<string, unknown>;
    isRequired: boolean;
    isNullable: boolean;
}>;

const BASE_COLUMNS: TableColumn<SchemaRow>[] = [
    {
        key: 'property',
        header: 'Property',
        className: 'font-mono',
        accessor: 'name'
    },
    {
        key: 'type',
        header: 'Type',
        className: 'text-gray-500',
        render: (row) => formatSchemaType(row.prop)
    }
];

const REQUIRED_COLUMN: TableColumn<SchemaRow> = {
    key: 'required',
    header: 'Required',
    render: (row) => (row.isRequired ? 'Yes' : '')
};

const NULLABLE_COLUMN: TableColumn<SchemaRow> = {
    key: 'nullable',
    header: 'Nullable',
    render: (row) => (row.isNullable ? 'Yes' : '')
};

const CONSTRAINTS_COLUMN: TableColumn<SchemaRow> = {
    key: 'constraints',
    header: 'Constraints',
    className: 'text-gray-500',
    render: (row) => formatConstraints(row.prop)
};

const REQUEST_COLUMNS: TableColumn<SchemaRow>[] = [
    ...BASE_COLUMNS,
    REQUIRED_COLUMN,
    CONSTRAINTS_COLUMN
];

const RESPONSE_COLUMNS: TableColumn<SchemaRow>[] = [
    ...BASE_COLUMNS,
    NULLABLE_COLUMN,
    CONSTRAINTS_COLUMN
];

export type SchemaSectionProps = Readonly<{
    title: string;
    schema: Record<string, unknown>;
    variant?: 'request' | 'response';
}>;

export const SchemaSection: React.FC<SchemaSectionProps> = ({
    title,
    schema,
    variant = 'request'
}) => {
    const resolved = resolveSchemaForTable(schema);

    const qualifier =
        resolved.isNullable || resolved.isArray
            ? ` (${[resolved.isNullable && 'nullable', resolved.isArray && 'array'].filter(Boolean).join(' ')})`
            : '';

    const rows = useMemo<SchemaRow[]>(() => {
        if (!resolved.properties) {
            return [];
        }

        return Object.entries(resolved.properties).map(([name, prop]) => ({
            name,
            prop,
            isRequired: resolved.required.includes(name),
            isNullable: isPropertyNullable(prop)
        }));
    }, [resolved]);

    const getRowKey = useCallback((row: SchemaRow) => row.name, []);

    const columns = variant === 'response' ? RESPONSE_COLUMNS : REQUEST_COLUMNS;

    return (
        <div>
            <Typography
                variant="body-xs"
                className="mb-1 font-medium uppercase tracking-wider text-gray-500"
            >
                {title}
                {qualifier}
            </Typography>

            {resolved.properties ? (
                <Table columns={columns} data={rows} rowKey={getRowKey} />
            ) : (
                <pre className="overflow-x-auto rounded bg-gray-50 p-2 text-xs dark:bg-gray-800/50">
                    {JSON.stringify(schema, null, 2)}
                </pre>
            )}
        </div>
    );
};
