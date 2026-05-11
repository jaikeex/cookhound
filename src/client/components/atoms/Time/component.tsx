import React from 'react';

export type TimeProps = Readonly<{
    dateTime: string | Date | null | undefined;
    className?: string;
    children: React.ReactNode;
}>;

const toIsoString = (
    value: string | Date | null | undefined
): string | undefined => {
    if (!value) {
        return undefined;
    }

    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
};

export const Time: React.FC<TimeProps> = ({
    dateTime,
    className,
    children
}) => {
    const iso = toIsoString(dateTime);

    return (
        <time dateTime={iso} className={className}>
            {children}
        </time>
    );
};
