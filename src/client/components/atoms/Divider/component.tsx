import React from 'react';
import { classNames } from '@/client/utils';

type DividerProps = Readonly<{
    className?: string;
    dashed?: boolean;
    subtle?: boolean;
    text?: string;
}>;

export const Divider: React.FC<DividerProps> = ({
    className,
    dashed,
    subtle,
    text
}) => {
    const hrClassName = classNames(
        'w-full',
        'border-t',
        dashed ? 'border-dashed' : 'border-solid',
        subtle
            ? 'border-gray-300 dark:border-gray-800'
            : 'border-gray-400 dark:border-gray-600'
    );

    return text ? (
        <div
            className={`flex items-center justify-center w-full gap-2 ${className}`}
        >
            <div className={hrClassName} />
            OR
            <div className={hrClassName} />
        </div>
    ) : (
        <div className={classNames(hrClassName, className)} />
    );
};
