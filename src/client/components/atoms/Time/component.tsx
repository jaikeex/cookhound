import React from 'react';

export type TimeProps = Readonly<{
    dateTime: string | Date;
    className?: string;
    children: React.ReactNode;
}>;

export const Time: React.FC<TimeProps> = ({
    dateTime,
    className,
    children
}) => {
    const iso =
        dateTime instanceof Date
            ? dateTime.toISOString()
            : new Date(dateTime).toISOString();

    return (
        <time dateTime={iso} className={className}>
            {children}
        </time>
    );
};
