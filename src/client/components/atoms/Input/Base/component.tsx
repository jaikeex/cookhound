'use client';

import React from 'react';
import { classNames } from '@/client/utils';

export type BaseInputProps = Readonly<{
    className?: string;
    ref?: React.RefObject<HTMLInputElement> | null;
}> &
    Omit<React.InputHTMLAttributes<HTMLInputElement>, 'ref'>;

export const BaseInput: React.FC<BaseInputProps> = ({
    className,
    ref,
    ...props
}) => {
    return (
        <input
            ref={ref}
            {...props}
            className={classNames('base-input', className)}
        />
    );
};
