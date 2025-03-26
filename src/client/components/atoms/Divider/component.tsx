import React from 'react';
import classnames from 'classnames';

type DividerProps = Readonly<{
    className?: string;
    dashed?: boolean;
    text?: string;
}>;

export const Divider: React.FC<DividerProps> = ({
    className,
    dashed,
    text
}) => {
    const hrClassName = classnames(
        'w-full border-gray-400 dark:border-gray-600',
        'border-t',
        dashed ? 'border-dashed' : 'border-solid'
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
        <div className={classnames(hrClassName, className)} />
    );
};
