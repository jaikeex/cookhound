import React from 'react';
import { classNames } from '@/client/utils';
import { Typography } from '@/client/components';

export type StatCardProps = Readonly<{
    className?: string;
    label: string;
    subtitle?: string;
    value: string | number;
}>;

export const StatCard: React.FC<StatCardProps> = ({
    className,
    label,
    subtitle,
    value
}) => {
    return (
        <div
            className={classNames(
                'rounded-lg border border-gray-200 bg-sheet p-4 shadow-sm',
                'dark:border-gray-700',
                className
            )}
        >
            <Typography>{label}</Typography>
            <Typography variant="heading-sm" className="mt-1 tabular-nums">
                {value}
            </Typography>

            {subtitle ? (
                <Typography variant="body-xs" className="mt-1">
                    {subtitle}
                </Typography>
            ) : null}
        </div>
    );
};
