import { classNames } from '@/client/utils';
import React from 'react';

export type LoaderProps = Readonly<{
    className?: string;
    size?: 'xs' | 'sm' | 'md' | 'lg';
}>;

export const Loader: React.FC<LoaderProps> = ({ size = 'md', className }) => {
    const sizes = {
        xs: 'w-3 h-3',
        sm: 'w-5 h-5',
        md: 'w-5 h-5',
        lg: 'w-7 h-7'
    };

    return (
        <span
            className={classNames(
                'inline-block animate-spin rounded-full border-[3px] border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white',
                sizes[size],
                className
            )}
        >
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p [clip:rect(0,0,0,0)]">
                Loading...
            </span>
        </span>
    );
};
