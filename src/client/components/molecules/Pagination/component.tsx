'use client';

import React, { useCallback, useMemo } from 'react';
import { BaseSelect, IconButton, Typography } from '@/client/components';
import { useLocale } from '@/client/store';
import { classNames } from '@/client/utils';

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50];

export type PaginationProps = Readonly<{
    className?: string;
    onPageChange: (page: number) => void;
    /** When left empty, size selector is hidden. */
    onPageSizeChange?: (pageSize: number) => void;
    /** Current page (indexes start at 1!) */
    page: number;
    pageSize: number;
    pageSizeOptions?: number[];
    totalItems: number;
}>;

export const Pagination: React.FC<PaginationProps> = ({
    page,
    pageSize,
    totalItems,
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
    className
}) => {
    const { t } = useLocale();

    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);

    const pages = useMemo(
        () => buildPageNumbers(safePage, totalPages),
        [safePage, totalPages]
    );

    // No callback on purpose
    const handlePageChange = (pageNumber: number) => () =>
        onPageChange(pageNumber);

    const handlePageSizeChange = useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            onPageSizeChange?.(Number(e.target.value));
            onPageChange(1);
        },
        [onPageSizeChange, onPageChange]
    );

    if (totalItems <= 0) {
        return null;
    }

    const isFirst = safePage <= 1;
    const isLast = safePage >= totalPages;

    return (
        <div
            className={classNames(
                'flex flex-col items-center gap-3',
                'sm:flex-row sm:justify-between',
                className
            )}
        >
            {/* Page size selector */}
            {onPageSizeChange ? (
                <div className="flex items-center gap-2">
                    <Typography variant="body-sm" className="text-secondary/80">
                        {t('app.pagination.rowsPerPage')}
                    </Typography>

                    <BaseSelect
                        value={String(pageSize)}
                        onChange={handlePageSizeChange}
                        className="w-auto! py-1! px-2! text-sm"
                    >
                        {pageSizeOptions.map((opt) => (
                            <option key={opt} value={String(opt)}>
                                {opt}
                            </option>
                        ))}
                    </BaseSelect>
                </div>
            ) : null}

            <div className="flex items-center gap-1">
                <IconButton
                    icon="chevronDoubleLeft"
                    size={16}
                    disabled={isFirst}
                    onClick={handlePageChange(1)}
                    className="p-1"
                />

                <IconButton
                    icon="chevronLeft"
                    size={16}
                    disabled={isFirst}
                    onClick={handlePageChange(safePage - 1)}
                    className="p-1"
                />

                {pages.map((p, i) =>
                    p === null ? (
                        <span
                            key={`ellipsis-${i}`}
                            className="px-1 text-sm text-secondary/60 select-none"
                        >
                            &hellip;
                        </span>
                    ) : (
                        <button
                            key={p}
                            type="button"
                            onClick={handlePageChange(p)}
                            className={classNames(
                                'min-w-7 rounded px-2 py-1',
                                'text-sm font-medium transition-colors',
                                p === safePage
                                    ? 'bg-primary-500 text-white'
                                    : 'text-secondary/80 hover:bg-gray-200 dark:hover:bg-gray-700'
                            )}
                        >
                            {p}
                        </button>
                    )
                )}

                <IconButton
                    icon="chevronRight"
                    size={16}
                    disabled={isLast}
                    onClick={handlePageChange(safePage + 1)}
                    className="p-1"
                />

                <IconButton
                    icon="chevronDoubleRight"
                    size={16}
                    disabled={isLast}
                    onClick={handlePageChange(totalPages)}
                    className="p-1"
                />
            </div>

            <Typography variant="body-sm" className="text-secondary/60">
                {t('app.pagination.page', {
                    page: safePage,
                    totalPages
                })}
            </Typography>
        </div>
    );
};

/**
 * Builds the array of page numbers and ellipsis markers to render.
 */
function buildPageNumbers(
    currentPage: number,
    totalPages: number
): (number | null)[] {
    if (totalPages <= 7) {
        // Show all pages
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages = new Set<number>();

    pages.add(1);
    pages.add(totalPages);
    pages.add(currentPage);

    if (currentPage - 1 >= 1) pages.add(currentPage - 1);
    if (currentPage + 1 <= totalPages) pages.add(currentPage + 1);

    const sorted = [...pages].sort((a, b) => a - b);
    const result: (number | null)[] = [];

    for (let i = 0; i < sorted.length; i++) {
        const current = sorted[i]!;
        const previous = sorted[i - 1];

        if (i > 0 && previous !== undefined) {
            const gap = current - previous;

            if (gap === 2) {
                // Show the single missing page
                result.push(previous + 1);
            } else if (gap > 2) {
                result.push(null);
            }
        }

        result.push(current);
    }

    return result;
}
