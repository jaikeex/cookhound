import React from 'react';
import { SkeletonBox } from '@/client/components';
import { classNames } from '@/client/utils';

export type SkeletonTableProps = Readonly<{
    rows?: number;
    className?: string;
}>;

export const SkeletonTable: React.FC<SkeletonTableProps> = ({
    rows = 5,
    className
}) => (
    <div
        className={classNames(
            'overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700',
            className
        )}
    >
        <div className="space-y-3 p-4">
            <SkeletonBox className="h-4 w-40" />

            {Array.from({ length: rows }).map((_, i) => (
                <SkeletonBox key={i} className="h-8 w-full" />
            ))}
        </div>
    </div>
);
