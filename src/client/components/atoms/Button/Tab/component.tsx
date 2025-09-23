import React from 'react';
import { classNames } from '@/client/utils';
import { Typography } from '@/client/components';

type TabButtonProps = Readonly<{
    active?: boolean;
    ariaLabel: string;
    className?: string;
    onClick: () => void;
    tabWidth: number;
}> &
    React.PropsWithChildren<NonNullable<unknown>>;

export const TabButton: React.FC<TabButtonProps> = ({
    active,
    ariaLabel,
    children,
    className,
    onClick,
    tabWidth
}) => {
    return (
        <button
            onClick={onClick}
            className={classNames(
                `z-10 px-4 py-2 rounded-sm cursor-pointer whitespace-nowrap`,
                className
            )}
            style={{
                width: `${tabWidth}%`
            }}
            aria-label={ariaLabel}
        >
            <Typography
                variant={'label'}
                className={
                    active
                        ? 'text-black dark:text-white'
                        : 'text-slate-600 dark:text-gray-400'
                }
            >
                {children}
            </Typography>
        </button>
    );
};
